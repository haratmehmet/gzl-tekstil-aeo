import { IBackupEngine } from "./backup-engine";
import { Readable } from "stream";
import prisma from "@/lib/prisma";

export class NodePrismaEngine implements IBackupEngine {
  name = "NodePrismaEngine (Vercel Fallback)";

  async isAvailable(): Promise<boolean> {
    // Prisma tabanlı olduğu için her zaman çalışabilir.
    return true;
  }

  async exportStream(dbUrl: string, logger?: (msg: string) => void): Promise<Readable> {
    if (logger) logger("Serverless ortamı tespit edildi. Prisma Data-Only Backup başlatılıyor...");

    // Create a custom readable stream that will push SQL data
    const readable = new Readable({
      read() {}
    });

    // Run the extraction process asynchronously
    this.extractData(readable, logger)
      .then(() => {
        readable.push(null); // End of stream
        if (logger) logger("Data-Only Backup (Vercel Fallback) okuma işlemi tamamlandı.");
      })
      .catch((err) => {
        if (logger) logger(`Vercel Backup Hatası: ${err.message}`);
        readable.destroy(err);
      });

    return readable;
  }

  private async extractData(stream: Readable, logger?: (msg: string) => void) {
    stream.push("-- GZL Backup - Serverless Data Dump\n");
    stream.push("-- Bu dump Vercel NodePrismaEngine tarafindan alinmistir.\n");
    stream.push(`-- Tarih: ${new Date().toISOString()}\n\n`);

    // 1. Get all table names in public schema
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename ASC
    `;

    if (logger) logger(`${tables.length} adet tablo bulundu. Dışa aktarılıyor...`);

    for (const table of tables) {
      const tableName = table.tablename;
      // Skip Prisma migrations table to avoid confusion, though usually safe
      if (tableName === "_prisma_migrations") continue;

      if (logger) logger(`Tablo yedekleniyor: ${tableName}`);
      stream.push(`\n-- TABLO VERISI: ${tableName}\n`);

      // 2. Query all rows for this table
      // Warning: In extremely large tables, this might exceed memory if not chunked, 
      // but Prisma raw queries do not support streams natively in Vercel edge. 
      // We assume reasonable data sizes for Vercel.
      const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "${tableName}"`);
      
      if (rows.length === 0) {
        stream.push(`-- (Bos tablo)\n`);
        continue;
      }

      for (const row of rows) {
        const columns = Object.keys(row).map(c => `"${c}"`).join(", ");
        const values = Object.values(row).map(val => this.escapeSqlValue(val)).join(", ");
        stream.push(`INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`);
      }
    }

    stream.push("\n-- DUMP SONU --\n");
  }

  private escapeSqlValue(val: any): string {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (val instanceof Date) return `'${val.toISOString()}'`;
    if (typeof val === "object") {
      // Json type
      return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    }
    // String type
    return `'${String(val).replace(/'/g, "''")}'`;
  }
}
