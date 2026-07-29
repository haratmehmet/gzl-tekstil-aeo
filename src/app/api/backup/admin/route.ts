import { NextResponse } from "next/server";
import { BackupService } from "@/features/backup/services/backup-service";
import { createBackupLog, updateBackupLog, logBackupStep } from "@/features/backup/actions";
import { requireMutationAuth } from "@/lib/session";
import prisma from "@/lib/prisma"

export const maxDuration = 60; // Allow maximum serverless execution time (up to 60s for Pro)

export async function POST(request: Request) {
  try {
    const user = await requireMutationAuth();
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await request.json();
    const action = body.action; 

    const service = new BackupService();

    if (action === "GET_STATS") {
      const drive = service.getDriveAuth();
      let quota = null;
      try {
        const quotaRes = await drive.about.get({ fields: "storageQuota" });
        quota = quotaRes.data.storageQuota;
      } catch (e) {
        console.error("Drive quota error", e);
      }

      const totalBackups = await prisma.backupLog.count({ where: { action: "BACKUP" } });
      const successfulBackups = await prisma.backupLog.count({ where: { action: "BACKUP", status: "SUCCESS" } });
      const successRate = totalBackups > 0 ? ((successfulBackups / totalBackups) * 100).toFixed(2) : "0.00";
      
      const allSuccess = await prisma.backupLog.findMany({
        where: { action: "BACKUP", status: "SUCCESS", fileSize: { not: null } },
        select: { fileSize: true }
      });
      let totalSize = 0;
      allSuccess.forEach(log => {
        if (log.fileSize && log.fileSize !== "Bilinmiyor") {
          totalSize += Number(log.fileSize) || 0;
        }
      });

      return NextResponse.json({
        success: true,
        stats: {
          totalBackups,
          successRate,
          totalSize,
          quota
        }
      });
    }

    if (action === "GET_LOGS") {
      // Clean up stuck IN_PROGRESS logs (older than 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      await prisma.backupLog.updateMany({
        where: { 
          status: "IN_PROGRESS",
          startedAt: { lt: fiveMinutesAgo }
        },
        data: { 
          status: "FAILED", 
          errorMessage: "İşlem sunucu tarafından yarıda kesildi (Zaman aşımı)" 
        }
      });

      const logs = await prisma.backupLog.findMany({
        orderBy: { startedAt: "desc" },
        take: 30,
      });
      return NextResponse.json({ success: true, logs });
    }

    if (action === "LIST") {
      const list = await service.getBackupsList();
      return NextResponse.json({ success: true, list });
    }

    if (action === "BACKUP") {
      await runAsyncBackup();
      return NextResponse.json({ success: true, message: "Yedekleme başarıyla tamamlandı." });
    }

    if (action === "RESTORE") {
      const { fileId, password } = body;
      if (!fileId) throw new Error("Dosya ID'si eksik");
      if (!password) throw new Error("Şifre girmelisiniz");

      const bcrypt = require("bcryptjs");
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Hatalı yönetici şifresi");
      
      await runAsyncRestore(fileId);
      return NextResponse.json({ success: true, message: "Geri yükleme işlemi başarıyla tamamlandı. Sayfayı yenileyebilirsiniz." });
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
      await logBackupStep(logId, msg);
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
      await logBackupStep(logId, msg);
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
