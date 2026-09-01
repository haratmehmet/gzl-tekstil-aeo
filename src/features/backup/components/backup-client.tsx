"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, HardDrive, AlertCircle, CheckCircle2, Clock, Download, History, RotateCcw, Activity, ShieldCheck, Server, Search } from "lucide-react"
import { formatDateToLocal } from "@/lib/utils"

export function BackupClient({ initialLogs }: any) {
  const [logs, setLogs] = useState<any[]>(initialLogs || [])
  const [driveList, setDriveList] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  // Polling for progress
  const [isBackupRunning, setIsBackupRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")

  // Modals
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [restoreFileId, setRestoreFileId] = useState("")
  const [restorePassword, setRestorePassword] = useState("")
  const [restoreConfirmText, setRestoreConfirmText] = useState("")

  const [logModalOpen, setLogModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isBackupRunning) {
      interval = setInterval(() => {
        fetchData(true)
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isBackupRunning])

  const fetchData = async (isPolling = false) => {
    try {
      const [listRes, statsRes] = await Promise.all([
        fetch("/api/backup/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "LIST" }) }),
        fetch("/api/backup/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "GET_STATS" }) })
      ])
      
      const listData = await listRes.json()
      const statsData = await statsRes.json()
      
      if (listData.success) setDriveList(listData.list)
      if (statsData.success) setStats(statsData.stats)

      // Get DB Logs
      // To get real-time logs we could fetch them via Server Action or API
      // But we can just use the initialLogs for historical, and if polling, we need an endpoint.
      // For now we will rely on initialLogs + manual refresh unless polling.
      // Let's create a quick way to fetch logs if polling.
      if (isPolling) {
        // Ideally we fetch logs. Let's assume we trigger a full server component refresh using router.refresh() 
        // But for steps we need API. We don't have a GET_LOGS API yet. 
        // I will add it to the API route in a moment!
        const logRes = await fetch("/api/backup/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "GET_LOGS" }) })
        const logData = await logRes.json()
        if (logData.success) {
          setLogs(logData.logs)
          
          // Check if still running
          const runningLog = logData.logs.find((l: any) => l.status === "IN_PROGRESS")
          if (runningLog) {
            const steps = runningLog.steps || []
            const lastStep = steps[steps.length - 1]
            if (lastStep) {
              setProgressText(lastStep.message)
              if (lastStep.message.includes("Başladı")) setProgress(10)
              else if (lastStep.message.includes("Dump")) setProgress(40)
              else if (lastStep.message.includes("Şifrelendi")) setProgress(60)
              else if (lastStep.message.includes("Yüklendi")) setProgress(85)
            }
          } else {
            setIsBackupRunning(false)
            setProgress(100)
            setProgressText("Tamamlandı")
            setTimeout(() => {
              setProgress(0)
              setProgressText("")
            }, 3000)
          }
        }
      }

    } catch (e) {
      console.error(e)
    }
  }

  const triggerBackup = async () => {
    setIsBackupRunning(true)
    setProgress(5)
    setProgressText("İstek gönderiliyor...")
    setMessage("")
    try {
      const res = await fetch("/api/backup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "BACKUP" })
      })
      const data = await res.json()
      if (!data.success) {
        setMessage("Hata: " + data.error)
        setIsBackupRunning(false)
      }
    } catch (e: any) {
      setMessage("Hata: " + e.message)
      setIsBackupRunning(false)
    }
  }

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (restoreConfirmText !== "BACKUP") {
      alert("Lütfen onay kutusuna büyük harflerle BACKUP yazın.")
      return
    }
    
    setIsLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/backup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "RESTORE", 
          fileId: restoreFileId,
          password: restorePassword
        })
      })
      const data = await res.json()
      setMessage(data.message || data.error)
      if (data.success) {
        setRestoreModalOpen(false)
        setRestorePassword("")
        setRestoreConfirmText("")
        fetchData(false)
      }
    } catch (e: any) {
      setMessage("Hata: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: string | number) => {
    if (!bytes || bytes === "Bilinmiyor") return "0 B";
    const b = Number(bytes);
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(2) + " KB";
    if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + " MB";
    return (b / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  const parseQuota = (quotaStr: string | null) => {
    if (!quotaStr) return "Bilinmiyor"
    const limit = 15 * 1024 * 1024 * 1024; // standard 15gb for service account
    return `${formatBytes(quotaStr)} / 15.00 GB`
  }

  const formatDuration = (ms: number) => {
    if (!ms) return "-"
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m} dk ${s} sn`
  }

  const getDriveFileId = (fileName: string) => {
    const f = driveList.find(d => d.name === fileName)
    return f ? f.id : null
  }

  const backupLogs = logs.filter(l => l.action === "BACKUP")

  return (
    <div className="space-y-6">
      
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Backup</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBackups || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Başarı Oranı: %{stats?.successRate || "0"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Boyut</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats?.totalSize || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">E-Posta Ek Boyutu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otomatik Plan</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">03:00</div>
            <p className="text-xs text-muted-foreground mt-1">Her gün (E-Posta gönderimi)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Güvenlik</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">AES-256</div>
            <p className="text-xs text-muted-foreground mt-1">Uçtan uca şifreli e-posta transferi</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Backup Action */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Manuel Yedekleme</h3>
              <p className="text-sm text-neutral-500 mt-1">Sistemin mevcut durumunu anında şifreleyerek belirlediğiniz e-posta adresine gönderir.</p>
            </div>
            
            <div className="flex-1 w-full max-w-md">
              {isBackupRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-blue-700">
                    <span>{progressText}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <Button onClick={triggerBackup} disabled={isBackupRunning} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
              {isBackupRunning ? (
                <><Activity className="w-4 h-4 mr-2 animate-pulse" /> İşleniyor...</>
              ) : (
                <><Database className="w-4 h-4 mr-2" /> Şimdi Yedekle</>
              )}
            </Button>
          </div>
          {message && <div className="mt-4 p-3 bg-white border rounded text-sm text-neutral-700">{message}</div>}
        </CardContent>
      </Card>

      {/* Detailed History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Yedekleme Geçmişi & Yönetim</CardTitle>
          <CardDescription>Bulutta saklanan veritabanı yedeklerinizi görüntüleyin ve geri yükleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b">
                <tr>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Boyut</th>
                  <th className="px-4 py-3">Süre</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {backupLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Kayıt bulunamadı.</td></tr>
                )}
                {backupLogs.map((log: any) => {
                  const driveId = getDriveFileId(log.fileName)
                  
                  return (
                  <tr key={log.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 font-medium">
                      {formatDateToLocal(log.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {log.fileSize ? formatBytes(log.fileSize) : "-"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {formatDuration(log.durationMs)}
                    </td>
                    <td className="px-4 py-3">
                      {log.status === "SUCCESS" && <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium"><CheckCircle2 className="w-3 h-3 mr-1"/> Başarılı</span>}
                      {log.status === "FAILED" && <span className="inline-flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-medium"><AlertCircle className="w-3 h-3 mr-1"/> Hata</span>}
                      {log.status === "IN_PROGRESS" && <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium"><Activity className="w-3 h-3 mr-1 animate-spin"/> İşleniyor</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedLog(log); setLogModalOpen(true) }}>
                          <Search className="w-4 h-4 text-neutral-500" />
                        </Button>
                        {driveId && log.status === "SUCCESS" && (
                          <>
                            <a href={`/api/backup/download?fileId=${driveId}&fileName=${log.fileName}`} target="_blank" rel="noreferrer">
                              <Button type="button" variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" /> İndir
                              </Button>
                            </a>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setRestoreFileId(driveId)
                                setRestoreModalOpen(true)
                              }}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" /> Restore
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Restore Modal */}
      {restoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[450px]">
            <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" /> UYARI: RESTORE
            </h3>
            <p className="text-sm text-gray-700 mb-6 bg-red-50 p-3 rounded border border-red-100">
              Bu işlem mevcut veritabanını <strong>tamamen silerek</strong> seçtiğiniz yedek dosyası ile ezecektir. Devam etmek için yetki onayı gereklidir.
            </p>
            <form onSubmit={handleRestoreSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Yönetici Şifreniz</label>
                <Input 
                  type="password" 
                  required 
                  value={restorePassword}
                  onChange={e => setRestorePassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Onaylamak için <strong>BACKUP</strong> yazın</label>
                <Input 
                  type="text" 
                  required 
                  placeholder="BACKUP"
                  value={restoreConfirmText}
                  onChange={e => setRestoreConfirmText(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setRestoreModalOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" variant="destructive" disabled={isLoading}>
                  {isLoading ? "Yükleniyor..." : "Geri Yükle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {logModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
          <div className="bg-neutral-900 text-neutral-300 p-6 rounded-xl shadow-xl w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Server className="w-5 h-5 mr-2" /> İşlem Logları
              </h3>
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white" onClick={() => setLogModalOpen(false)}>
                Kapat
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto bg-black p-4 rounded border border-neutral-800 font-mono text-sm space-y-2">
              <div className="text-blue-400">[{formatDateToLocal(selectedLog.startedAt)}] İşlem Başlatıldı: {selectedLog.action}</div>
              
              {selectedLog.steps && selectedLog.steps.length > 0 ? (
                selectedLog.steps.map((step: any, idx: number) => (
                  <div key={idx} className="text-neutral-300">
                    <span className="text-neutral-500">[{step.time ? new Date(step.time).toLocaleTimeString("tr-TR") : "-"}]</span> {step.message}
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 italic">Detaylı log bulunamadı.</div>
              )}

              {selectedLog.status === "SUCCESS" && (
                <div className="text-emerald-400">[{formatDateToLocal(selectedLog.completedAt)}] İşlem Başarıyla Tamamlandı.</div>
              )}
              {selectedLog.status === "FAILED" && (
                <div className="text-red-400">[{formatDateToLocal(selectedLog.completedAt)}] HATA: {selectedLog.errorMessage}</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
