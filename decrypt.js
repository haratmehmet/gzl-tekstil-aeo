const crypto = require("crypto");
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

console.log("=== GZL YEDEK ÇÖZÜCÜ ===");

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Kullanım: node decrypt.js <Sifreli_Dosya_Yolu> <32_Karakter_Sifre>");
  console.log("Örnek: node decrypt.js backup-2026-07-27.sql.gz.enc 12345678901234567890123456789012");
  process.exit(1);
}

const inputPath = path.resolve(args[0]);
let rawKey = args[1];

if (rawKey.length !== 32) {
  console.log("UYARI: Şifreniz 32 karakter değil! Sistem 32 karaktere tamamlıyor...");
  rawKey = rawKey.padEnd(32, '0').substring(0, 32);
}

const key = Buffer.from(rawKey, "utf-8");
const outputPath = inputPath.replace(".enc", "").replace(".gz", "");

if (!fs.existsSync(inputPath)) {
  console.error("HATA: Girdiğiniz dosya bulunamadı:", inputPath);
  process.exit(1);
}

console.log("İşlem başlatılıyor...");
console.log("Girdi:", inputPath);
console.log("Çıktı (Açılmış SQL):", outputPath);

try {
  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);

  // Read the first 16 bytes for the IV
  readStream.once("readable", () => {
    const iv = readStream.read(16);
    if (!iv) {
      console.error("HATA: Dosya çok küçük veya bozuk.");
      process.exit(1);
    }

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    const gunzip = zlib.createGunzip();

    // Since we appended the Auth Tag at the end, we need a custom transform to intercept the last 16 bytes.
    const { Transform } = require("stream");
    
    class ExtractAuthTag extends Transform {
      constructor() {
        super();
        this.buffer = Buffer.alloc(0);
      }

      _transform(chunk, encoding, callback) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        if (this.buffer.length > 16) {
          const toPush = this.buffer.subarray(0, this.buffer.length - 16);
          this.buffer = this.buffer.subarray(this.buffer.length - 16);
          this.push(toPush);
        }
        callback();
      }

      _flush(callback) {
        if (this.buffer.length === 16) {
          decipher.setAuthTag(this.buffer);
          callback();
        } else {
          callback(new Error("Dosya eksik veya bozuk, Auth Tag bulunamadı."));
        }
      }
    }

    const extractor = new ExtractAuthTag();

    readStream
      .pipe(extractor)
      .pipe(decipher)
      .pipe(gunzip)
      .pipe(writeStream)
      .on("finish", () => {
        console.log("\nBAŞARILI! Yedek başarıyla çözüldü ve SQL metnine çevrildi.");
        console.log("Bu SQL dosyasını artık doğrudan veritabanınıza yükleyebilirsiniz.");
      })
      .on("error", (err) => {
        console.error("\nHATA: Çözümleme başarısız!", err.message);
        console.log("Lütfen şifrenizi (BACKUP_ENCRYPTION_KEY) doğru yazdığınızdan emin olun.");
      });
  });

} catch (err) {
  console.error("Beklenmeyen Hata:", err);
}
