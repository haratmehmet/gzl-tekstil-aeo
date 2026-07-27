import { NextResponse } from "next/server";
import { BackupService } from "@/features/backup/services/backup-service";
import { createBackupLog, updateBackupLog } from "@/features/backup/actions";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Cron isteğine anında cevap dön (Timeout yememek için)
    // Asıl backup'ı asenkron background task olarak tetikle
    runAsyncBackup();

    return NextResponse.json({ success: true, message: "Backup işlemi başlatıldı" });
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
      // Konsola veya log tablosuna ek detay yazılabilir
      console.log(`[BACKUP CRON] ${msg}`);
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
