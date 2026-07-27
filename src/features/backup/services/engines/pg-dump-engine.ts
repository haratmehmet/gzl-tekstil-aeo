import { IBackupEngine } from "./backup-engine";
import { Readable } from "stream";
import { spawn } from "child_process";

export class PgDumpEngine implements IBackupEngine {
  name = "PgDumpEngine (Native)";

  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const p = spawn("pg_dump", ["--version"]);
      p.on("close", (code) => {
        resolve(code === 0);
      });
      p.on("error", () => {
        resolve(false);
      });
    });
  }

  async exportStream(dbUrl: string, logger?: (msg: string) => void): Promise<Readable> {
    if (logger) logger("PostgreSQL pg_dump binary çalıştırılıyor...");
    
    return new Promise((resolve, reject) => {
      // Dump in plain text format so we can compress it in Node
      const pgDump = spawn("pg_dump", [
        dbUrl,
        "--clean",
        "--if-exists",
        "--no-owner",
        "--no-privileges",
        // No --format=custom because we want raw SQL text to pipe through zlib in BackupService
      ]);

      let errorOutput = "";

      pgDump.stderr.on("data", (data) => {
        const msg = data.toString();
        errorOutput += msg;
        if (logger) logger(`[pg_dump] ${msg.trim()}`);
      });

      pgDump.on("error", (error) => {
        if (logger) logger(`pg_dump başlatılamadı: ${error.message}`);
        reject(error);
      });

      // Wait a tiny bit to make sure it didn't instantly crash
      setTimeout(() => {
        if (pgDump.exitCode === null) {
          resolve(pgDump.stdout);
        } else if (pgDump.exitCode !== 0) {
          reject(new Error(`pg_dump failed immediately: ${errorOutput}`));
        }
      }, 500);
    });
  }
}
