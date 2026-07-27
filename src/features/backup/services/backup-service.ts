import { spawn } from "child_process";
import { google } from "googleapis";
import { GcmEncryptStream, GcmDecryptStream } from "./crypto-stream";
import { Readable, PassThrough } from "stream";
import { PgDumpEngine } from "./engines/pg-dump-engine";
import { NodePrismaEngine } from "./engines/node-prisma-engine";
import zlib from "zlib";

export class BackupService {
  private driveFolderId: string;
  private key: Buffer;
  private drive: any;
  private dbUrl: string;

  constructor() {
    this.driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";
    this.dbUrl = process.env.DATABASE_URL || "";
    
    const rawKey = process.env.BACKUP_ENCRYPTION_KEY || "";
    if (rawKey.length !== 32) {
      console.warn("BACKUP_ENCRYPTION_KEY 32 karakter değil. Fallback kullanılıyor.");
    }
    // GCM requires exact 32 bytes key
    this.key = Buffer.from(rawKey.padEnd(32, '0').substring(0, 32), "utf-8");

    try {
      let credentials;
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      }
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.readonly"],
      });
      this.drive = google.drive({ version: "v3", auth });
    } catch (error) {
      console.error("Google Drive Auth Error:", error);
      this.drive = null;
    }
  }

  public getDriveAuth() {
    return this.drive;
  }

  public async runFullBackup(logger: (msg: string) => Promise<void> | void) {
    if (!this.drive) throw new Error("Google Drive Service çalışmıyor.");
    
    await logger("Backup Başladı");
    if (!this.dbUrl) throw new Error("DATABASE_URL bulunamadı.");

    // Adaptif Engine Seçimi
    const pgDumpEngine = new PgDumpEngine();
    const isPgDumpAvailable = await pgDumpEngine.isAvailable();
    const engine = isPgDumpAvailable ? pgDumpEngine : new NodePrismaEngine();
    
    await logger(`Kullanılan Motor: ${engine.name}`);

    const fileName = `backup-${new Date().toISOString().split("T")[0]}.sql.gz.enc`;
    await logger("Database Dump Başlıyor...");
    
    const sqlStream = await engine.exportStream(this.dbUrl, async (msg) => {
      await logger(msg);
    });

    await logger("Sıkıştırma ve Şifreleme (Stream Aktif)");

    const gzip = zlib.createGzip();
    const encryptStream = new GcmEncryptStream(this.key);
    
    let sizeBytes = 0;
    encryptStream.on("data", (chunk) => {
      sizeBytes += chunk.length;
    });

    // Pipeline: SQL -> GZIP -> AES-256 -> Upload
    const uploadStream = new PassThrough();
    sqlStream.pipe(gzip).pipe(encryptStream).pipe(uploadStream);

    await logger("Google Drive'a Yükleniyor...");
    
    const res = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [this.driveFolderId],
      },
      media: {
        body: uploadStream,
      },
    });

    const fileId = res.data.id;
    const finalSize = res.data.size || sizeBytes.toString(); 

    await logger("Eski Backup'lar Temizleniyor (30 Gün Politikası)");
    await this.cleanOldBackups();

    await logger("Tamamlandı");
    
    return { fileName, fileId, sizeBytes: finalSize };
  }

  public async cleanOldBackups() {
    if (!this.drive) return 0;
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const timeStr = date.toISOString();

    const query = `'${this.driveFolderId}' in parents and modifiedTime < '${timeStr}' and trashed = false`;
    
    const res = await this.drive.files.list({
      q: query,
      fields: "files(id, name)",
    });

    const files = res.data.files || [];
    for (const file of files) {
      if (file.id) {
        await this.drive.files.delete({ fileId: file.id });
      }
    }
    return files.length;
  }
  
  public async getBackupsList() {
    if (!this.drive) return [];
    const query = `'${this.driveFolderId}' in parents and trashed = false`;
    const res = await this.drive.files.list({
      q: query,
      fields: "files(id, name, size, modifiedTime)",
      orderBy: "modifiedTime desc",
    });
    return res.data.files || [];
  }

  public async restoreFromDrive(fileId: string, logger: (msg: string) => Promise<void> | void) {
    if (!this.drive) throw new Error("Google Drive Service çalışmıyor.");
    
    await logger("Restore Başladı: Dosya İndiriliyor");
    
    const res = await this.drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    await logger("Deşifreleme ve Zlib Çıkarma Başladı");
    
    const decryptStream = new GcmDecryptStream(this.key);
    const gunzip = zlib.createGunzip();

    (res.data as any).pipe(decryptStream).pipe(gunzip);

    // Restore depends on pg_restore/psql availability.
    // If not available, node-based restore is very complex.
    // Since restore is usually a manual operation done by Admin on VPS/Local, 
    // we will rely on pg_restore/psql binary.
    const pgDumpEngine = new PgDumpEngine();
    if (!(await pgDumpEngine.isAvailable())) {
      throw new Error("Sistemde psql / pg_restore kurulu değil. Vercel ortamında geri yükleme desteklenmiyor. Lütfen SQL yedeğini indirip manuel yükleyiniz.");
    }

    if (!this.dbUrl) throw new Error("DATABASE_URL bulunamadı.");
    const parsed = new URL(this.dbUrl);
    const pgUser = parsed.username;
    const pgPass = parsed.password;
    const pgHost = parsed.hostname;
    const pgPort = parsed.port || "5432";
    const pgDb = parsed.pathname.substring(1);

    const env = { ...process.env, PGPASSWORD: pgPass };
    
    await logger("Veritabanına yükleniyor...");

    // Since our backup is plain text SQL (from both engines), we use `psql` to restore, not `pg_restore`.
    // pg_restore is only for custom format dumps.
    const restoreProcess = spawn("psql", [
      "-U", pgUser,
      "-h", pgHost,
      "-p", pgPort,
      "-d", pgDb,
      "-v", "ON_ERROR_STOP=1"
    ], { env });

    gunzip.pipe(restoreProcess.stdin);

    let restoreError = "";
    restoreProcess.stderr.on("data", (data) => {
      restoreError += data.toString();
    });

    const exitCode = await new Promise((resolve) => {
      restoreProcess.on("close", resolve);
    });

    if (exitCode !== 0) {
      throw new Error(`psql restore hatası: ${restoreError}`);
    }

    await logger("Restore Tamamlandı");
  }
}
