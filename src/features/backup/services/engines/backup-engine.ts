import { Readable } from "stream";

export interface IBackupEngine {
  /**
   * The name of the engine (e.g. "PgDumpEngine", "NodePrismaEngine")
   */
  name: string;

  /**
   * Checks if this engine can be used in the current environment
   */
  isAvailable(): Promise<boolean>;

  /**
   * Starts the backup process and returns a Readable stream of the SQL dump.
   * Note: The stream should ideally be raw SQL data. If compression is handled inside,
   * it must be documented, but we prefer outputting raw text/sql and letting BackupService compress it.
   * @param dbUrl Database connection URL
   * @param logger Callback for logging progress
   */
  exportStream(dbUrl: string, logger?: (msg: string) => void): Promise<Readable>;
}
