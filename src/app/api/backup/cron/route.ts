import { NextResponse } from "next/server";
import { BackupService } from "@/features/backup/services/backup-service";
import { createBackupLog, updateBackupLog, logBackupStep } from "@/features/backup/actions";

export const maxDuration = 60; // Allow maximum serverless execution time (up to 60s for Pro)

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await runAsyncBackup();
    return NextResponse.json({ success: true, message: "Backup işlemi başarıyla tamamlandı" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function runAsyncBackup() {
  let logId = "";
  try {
    const service = new BackupService();
    const log = await createBackupLog("BACKUP");
    logId = log.id;

    const result = await service.runFullBackup(async (msg) => {
      console.log(`[BACKUP CRON] ${msg}`);
      await logBackupStep(logId, msg);
    });

    await updateBackupLog(logId, {
      status: "SUCCESS",
      fileSize: result.sizeBytes.toString(),
      completedAt: new Date(),
    });
  } catch (err: any) {
    console.error("[BACKUP CRON ERROR]", err);
    if (logId) {
      await updateBackupLog(logId, {
        status: "FAILED",
        errorMessage: err.message || "Bilinmeyen hata",
        completedAt: new Date(),
      });
    }
  }
}
