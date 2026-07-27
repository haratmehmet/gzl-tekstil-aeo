"use server"

import prisma from "@/lib/prisma"

export async function createBackupLog(action: string, fileName?: string) {
  return await prisma.backupLog.create({
    data: {
      action,
      status: "IN_PROGRESS",
      fileName,
    }
  })
}

export async function updateBackupLog(
  id: string, 
  data: { 
    status: string, 
    errorMessage?: string, 
    fileSize?: string,
    completedAt?: Date
  }
) {
  const log = await prisma.backupLog.findUnique({ where: { id } })
  let durationMs = undefined;
  if (data.completedAt && log?.startedAt) {
    durationMs = data.completedAt.getTime() - log.startedAt.getTime();
  }

  return await prisma.backupLog.update({
    where: { id },
    data: {
      ...data,
      durationMs,
    }
  })
}

export async function getBackupLogs(take = 30) {
  return await prisma.backupLog.findMany({
    orderBy: { startedAt: "desc" },
    take,
  })
}

export async function getLatestBackupStatus() {
  const lastSuccess = await prisma.backupLog.findFirst({
    where: { status: "SUCCESS", action: "BACKUP" },
    orderBy: { completedAt: "desc" },
  })

  const lastFailed = await prisma.backupLog.findFirst({
    where: { status: "FAILED", action: "BACKUP" },
    orderBy: { completedAt: "desc" },
  })

  return { lastSuccess, lastFailed }
}
