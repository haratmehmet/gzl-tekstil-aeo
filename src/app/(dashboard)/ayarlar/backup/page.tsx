export const dynamic = "force-dynamic"

import { getBackupLogs, getLatestBackupStatus } from "@/features/backup/actions"
import { BackupClient } from "@/features/backup/components/backup-client"

export const metadata = {
  title: "Backup Merkezi | GZL Tekstil",
}

export default async function BackupPage() {
  const logs = await getBackupLogs(30)
  const { lastSuccess, lastFailed } = await getLatestBackupStatus()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Backup Merkezi</h2>
      </div>
      <div className="hidden md:flex flex-col space-y-4">
        <BackupClient 
          initialLogs={logs} 
          lastSuccess={lastSuccess} 
          lastFailed={lastFailed} 
        />
      </div>
    </div>
  )
}
