import { NextResponse } from "next/server";
import { BackupService } from "@/features/backup/services/backup-service";
import { createBackupLog, updateBackupLog } from "@/features/backup/actions";
import { requireMutationAuth } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await requireMutationAuth();
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await request.json();
    const action = body.action; // "BACKUP", "RESTORE", "LIST"

    const service = new BackupService();

    if (action === "LIST") {
      const list = await service.getBackupsList();
      return NextResponse.json({ success: true, list });
    }

    if (action === "BACKUP") {
      // Background execution for Vercel timeout limits
      runAsyncBackup();
      return NextResponse.json({ success: true, message: "Yedekleme arka planda başlatıldı." });
    }

    if (action === "RESTORE") {
      const { fileId, password } = body;
      if (!fileId) throw new Error("Dosya ID'si eksik");
      if (!password) throw new Error("Şifre girmelisiniz");

      const bcrypt = require("bcryptjs");
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Hatalı yönetici şifresi");
      
      runAsyncRestore(fileId);
      return NextResponse.json({ success: true, message: "Geri yükleme işlemi başlatıldı. Veritabanınız birazdan güncellenecek." });
    }

    return NextResponse.json({ success: false, message: "Geçersiz işlem" }, { status: 400 });
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
      console.log(`[BACKUP ADMIN] ${msg}`);
    });

    await updateBackupLog(logId, {
      status: "SUCCESS",
      fileSize: result.sizeBytes.toString(),
      completedAt: new Date(),
    });
  } catch (err: any) {
    console.error("[BACKUP ADMIN ERROR]", err);
    if (logId) {
      await updateBackupLog(logId, {
        status: "FAILED",
        errorMessage: err.message || "Bilinmeyen hata",
        completedAt: new Date(),
      });
    }
  }
}

async function runAsyncRestore(fileId: string) {
  let logId = "";
  try {
    const service = new BackupService();
    const log = await createBackupLog("RESTORE", fileId);
    logId = log.id;

    await service.restoreFromDrive(fileId, async (msg) => {
      console.log(`[RESTORE ADMIN] ${msg}`);
    });

    await updateBackupLog(logId, {
      status: "SUCCESS",
      completedAt: new Date(),
    });
  } catch (err: any) {
    console.error("[RESTORE ADMIN ERROR]", err);
    if (logId) {
      await updateBackupLog(logId, {
        status: "FAILED",
        errorMessage: err.message || "Bilinmeyen hata",
        completedAt: new Date(),
      });
    }
  }
}
