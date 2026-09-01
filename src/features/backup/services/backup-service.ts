import nodemailer from "nodemailer";
import { GcmEncryptStream } from "./crypto-stream";
import { PassThrough } from "stream";
import { PgDumpEngine } from "./engines/pg-dump-engine";
import { NodePrismaEngine } from "./engines/node-prisma-engine";
import zlib from "zlib";

export class BackupService {
  private key: Buffer;
  private dbUrl: string;

  constructor() {
    this.dbUrl = process.env.DATABASE_URL || "";
    
    const rawKey = process.env.BACKUP_ENCRYPTION_KEY || "";
    if (rawKey.length !== 32) {
      console.warn("BACKUP_ENCRYPTION_KEY 32 karakter değil. Fallback kullanılıyor.");
    }
    this.key = Buffer.from(rawKey.padEnd(32, '0').substring(0, 32), "utf-8");
  }

  public async runFullBackup(logger: (msg: string) => Promise<void> | void) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP_USER veya SMTP_PASS bulunamadı. Lütfen e-posta bilgilerinizi sisteme girin.");
    }
    
    await logger("Backup Başladı");
    if (!this.dbUrl) throw new Error("DATABASE_URL bulunamadı.");

    const pgDumpEngine = new PgDumpEngine();
    const isPgDumpAvailable = await pgDumpEngine.isAvailable();
    const engine = isPgDumpAvailable ? pgDumpEngine : new NodePrismaEngine();
    
    await logger(`Kullanılan Motor: ${engine.name}`);

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `GZLBACKUP-${dateStr}.sql.gz.enc`;
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

    const uploadStream = new PassThrough();
    sqlStream.pipe(gzip).pipe(encryptStream).pipe(uploadStream);

    await logger("E-Posta olarak gönderiliyor...");
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"GZL Yedekleme" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `GZLBACKUP - Veritabanı Yedeği (${dateStr})`,
      text: "Otomatik veritabanı yedeğiniz şifreli olarak ektedir. Geri yüklemek istediğinizde bu dosyayı sisteme yükleyebilirsiniz.",
      attachments: [
        {
          filename: fileName,
          content: uploadStream
        }
      ]
    });

    await logger(`Yedekleme Başarılı! E-posta adresinize (${process.env.SMTP_USER}) gönderildi.`);

    return {
      fileName,
      sizeBytes,
    };
  }

  public async getBackupsList() {
    // E-posta yedeklemesinde bulut listesi yoktur.
    return [];
  }
}
