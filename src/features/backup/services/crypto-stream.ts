import crypto from "crypto";
import { Transform, TransformCallback } from "stream";

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

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    const encrypted = this.cipher.update(chunk);
    if (encrypted.length > 0) {
      this.push(encrypted);
    }
    callback();
  }

  _flush(callback: TransformCallback) {
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

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
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

  _flush(callback: TransformCallback) {
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
