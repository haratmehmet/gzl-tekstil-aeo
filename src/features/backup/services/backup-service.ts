import crypto from "crypto";
import { Transform } from "stream";
import { spawn } from "child_process";
import { google } from "googleapis";

// AES-256-GCM Encryption Stream for large files
export class GcmEncryptStream extends Transform {
  private cipher: crypto.CipherGCM;
  private iv: Buffer;

  constructor(key: Buffer) {
    super();
    this.iv = crypto.randomBytes(16);
    this.cipher = crypto.createCipheriv("aes-256-gcm", key, this.iv);
    // Prepended IV
    this.push(this.iv);
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: crypto.TransformCallback) {
    const encrypted = this.cipher.update(chunk);
    if (encrypted.length > 0) {
      this.push(encrypted);
    }
    callback();
  }

  _flush(callback: crypto.TransformCallback) {
    const final = this.cipher.final();
    if (final.length > 0) {
      this.push(final);
    }
    // Append Auth Tag at the very end
    const tag = this.cipher.getAuthTag();
    this.push(tag);
    callback();
  }
}

// AES-256-GCM Decryption Stream for large files
export class GcmDecryptStream extends Transform {
  private decipher!: crypto.DecipherGCM;
  private key: Buffer;
  private iv?: Buffer;
  private buffer: Buffer = Buffer.alloc(0);

  constructor(key: Buffer) {
    super();
    this.key = key;
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: crypto.TransformCallback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    if (!this.iv && this.buffer.length >= 16) {
      this.iv = this.buffer.subarray(0, 16);
      this.buffer = this.buffer.subarray(16);
      this.decipher = crypto.createDecipheriv("aes-256-gcm", this.key, this.iv);
    }

    if (this.iv && this.buffer.length > 16) {
      const dataToDecrypt = this.buffer.subarray(0, this.buffer.length - 16);
      this.buffer = this.buffer.subarray(this.buffer.length - 16);

      const decrypted = this.decipher.update(dataToDecrypt);
      if (decrypted.length > 0) {
        this.push(decrypted);
      }
    }
    callback();
  }

  _flush(callback: crypto.TransformCallback) {
    if (this.buffer.length === 16) {
      this.decipher.setAuthTag(this.buffer);
      try {
        const final = this.decipher.final();
        if (final.length > 0) {
          this.push(final);
        }
        callback();
      } catch (err: any) {
        callback(new Error("Deşifreleme hatası: Veri bozuk veya şifre yanlış."));
      }
    } else {
      callback(new Error("Invalid stream end, missing auth tag"));
    }
  }
}

export class BackupService {
  private driveFolderId: string;
  private key: Buffer;

  constructor() {
    this.driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";
    const rawKey = process.env.BACKUP_ENCRYPTION_KEY || "";
    if (rawKey.length !== 32) {
      throw new Error("BACKUP_ENCRYPTION_KEY 32 karakter uzunluğunda olmalıdır.");
    }
    this.key = Buffer.from(rawKey, "utf-8");
  }

  private getDriveAuth() {
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
    } catch (e) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON geçerli bir JSON değil.");
    }

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("Eksik Google Service Account kimlik bilgileri.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    return google.drive({ version: "v3", auth });
  }

  public async runFullBackup(logger: (msg: string) => Promise<void>) {
    await logger("Backup Başladı");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL bulunamadı.");

    const fileName = `backup-${new Date().toISOString().split("T")[0]}.sql.gz.enc`;

    await logger("Database Dump Alındı (Stream)");
    
    // Spawn pg_dump
    const parsed = new URL(dbUrl);
    const pgUser = parsed.username;
    const pgPass = parsed.password;
    const pgHost = parsed.hostname;
    const pgPort = parsed.port || "5432";
    const pgDb = parsed.pathname.substring(1);

    const env = { ...process.env, PGPASSWORD: pgPass };
    const dumpProcess = spawn("pg_dump", [
      "-U", pgUser,
      "-h", pgHost,
      "-p", pgPort,
      "-d", pgDb,
      "-F", "c", // Custom format (compressed)
      "-Z", "9"  // Max compression
    ], { env });

    await logger("Şifrelendi (Stream Aktif)");

    const encryptStream = new GcmEncryptStream(this.key);
    
    // Pipe dump stdout -> encrypt stream
    dumpProcess.stdout.pipe(encryptStream);

    let dumpError = "";
    dumpProcess.stderr.on("data", (data) => {
      dumpError += data.toString();
    });

    const drive = this.getDriveAuth();
    
    await logger("Google Drive'a Yüklendi");
    
    // Upload stream to drive
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [this.driveFolderId],
      },
      media: {
        body: encryptStream,
      },
    });

    const exitCode = await new Promise((resolve) => {
      dumpProcess.on("close", resolve);
    });

    if (exitCode !== 0) {
      throw new Error(`pg_dump başarısız oldu: ${dumpError}`);
    }

    const fileId = res.data.id;
    const sizeBytes = res.data.size || "Bilinmiyor"; 

    await logger("Eski Backup Silindi (30 Gün Politikası)");
    await this.cleanOldBackups();

    await logger("Tamamlandı");
    
    return { fileName, fileId, sizeBytes };
  }

  public async cleanOldBackups() {
    const drive = this.getDriveAuth();
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const timeStr = date.toISOString();

    const query = `'${this.driveFolderId}' in parents and modifiedTime < '${timeStr}' and trashed = false`;
    
    const res = await drive.files.list({
      q: query,
      fields: "files(id, name)",
    });

    const files = res.data.files || [];
    for (const file of files) {
      if (file.id) {
        await drive.files.delete({ fileId: file.id });
      }
    }
    return files.length;
  }
  
  public async getBackupsList() {
    const drive = this.getDriveAuth();
    const query = `'${this.driveFolderId}' in parents and trashed = false`;
    const res = await drive.files.list({
      q: query,
      fields: "files(id, name, size, modifiedTime)",
      orderBy: "modifiedTime desc",
    });
    return res.data.files || [];
  }

  public async restoreFromDrive(fileId: string, logger: (msg: string) => Promise<void>) {
    await logger("Restore Başladı: Dosya İndiriliyor");
    
    const drive = this.getDriveAuth();
    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    await logger("Deşifreleme ve Veritabanı Yüklemesi Başladı");
    
    const decryptStream = new GcmDecryptStream(this.key);
    (res.data as any).pipe(decryptStream);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL bulunamadı.");

    const parsed = new URL(dbUrl);
    const pgUser = parsed.username;
    const pgPass = parsed.password;
    const pgHost = parsed.hostname;
    const pgPort = parsed.port || "5432";
    const pgDb = parsed.pathname.substring(1);

    const env = { ...process.env, PGPASSWORD: pgPass };
    
    const restoreProcess = spawn("pg_restore", [
      "-U", pgUser,
      "-h", pgHost,
      "-p", pgPort,
      "-d", pgDb,
      "--clean",      // Drop DB objects before recreating
      "--if-exists",  // Don't fail on dropping non-existent objects
      "--no-owner",   // Skip ownership restoration
      "--no-privileges" // Skip privileges restoration
    ], { env });

    decryptStream.pipe(restoreProcess.stdin);

    let restoreError = "";
    restoreProcess.stderr.on("data", (data) => {
      restoreError += data.toString();
    });

    const exitCode = await new Promise((resolve) => {
      restoreProcess.on("close", resolve);
    });

    if (exitCode !== 0) {
      console.warn(`pg_restore uyarıları/hataları: ${restoreError}`);
    }

    await logger("Restore Tamamlandı");
  }
}
