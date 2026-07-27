"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, HardDrive, AlertCircle, CheckCircle2, Clock, Trash2, History, RotateCcw } from "lucide-react"
import { formatDateToLocal } from "@/lib/utils"

export function BackupClient({ initialLogs, lastSuccess, lastFailed }: any) {
  const [logs, setLogs] = useState(initialLogs)
  const [driveList, setDriveList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  // Restore Modal State
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [restoreFileId, setRestoreFileId] = useState("")
  const [restorePassword, setRestorePassword] = useState("")
  const [restoreConfirmText, setRestoreConfirmText] = useState("")

  useEffect(() => {
    fetchDriveList()
  }, [])

  const fetchDriveList = async () => {
    try {
      const res = await fetch("/api/backup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LIST" })
      })
      const data = await res.json()
      if (data.success) {
        setDriveList(data.list)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const triggerBackup = async () => {
    if (!confirm("Manuel yedekleme başlatmak istiyor musunuz?")) return
    setIsLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/backup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "BACKUP" })
      })
      const data = await res.json()
      setMessage(data.message || data.error)
    } catch (e: any) {
      setMessage("Hata: " + e.message)
    } finally {
      setIsLoading(false)
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
      }
    } catch (e: any) {
      setMessage("Hata: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: string | number) => {
    if (!bytes || bytes === "Bilinmiyor") return "Bilinmiyor";
    const b = Number(bytes);
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(2) + " KB";
    return (b / (1024 * 1024)).toFixed(2) + " MB";
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son Başarılı Yedek</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastSuccess ? formatDateToLocal(lastSuccess.completedAt) : "Hiç alınmadı"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Boyut: {lastSuccess?.fileSize ? formatBytes(lastSuccess.fileSize) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son Hata</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {lastFailed ? formatDateToLocal(lastFailed.completedAt) : "Hata Yok"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planlanan Yedek</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">03:00</div>
            <p className="text-xs text-muted-foreground mt-1">Her gün otomatik (Cron)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google Drive</CardTitle>
            <HardDrive className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Aktif</div>
            <p className="text-xs text-muted-foreground mt-1">Service Account Bağlı</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={triggerBackup} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Database className="w-4 h-4 mr-2" />
          Şimdi Yedekle
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-muted rounded-md text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Google Drive Yedek Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {driveList.length === 0 && <p className="text-sm text-muted-foreground">Drive'da yedek bulunamadı.</p>}
              {driveList.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateToLocal(file.modifiedTime)} • {formatBytes(file.size)}
                    </span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setRestoreFileId(file.id)
                      setRestoreModalOpen(true)
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Yükle
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">İşlem Geçmişi (Loglar)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.length === 0 && <p className="text-sm text-muted-foreground">Henüz log yok.</p>}
              {logs.map((log: any) => (
                <div key={log.id} className="flex flex-col p-3 border-b last:border-0 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>{log.action}</span>
                    <span className={log.status === "SUCCESS" ? "text-green-600" : log.status === "FAILED" ? "text-red-600" : "text-yellow-600"}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDateToLocal(log.startedAt)} 
                    {log.durationMs ? ` • ${log.durationMs}ms` : ""}
                  </div>
                  {log.errorMessage && (
                    <div className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded">{log.errorMessage}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {restoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" /> DİKKAT: RESTORE
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Bu işlem mevcut veritabanını <strong>tamamen silerek</strong> seçtiğiniz yedek dosyası ile ezecektir. Bu işlem geri alınamaz!
            </p>
            <form onSubmit={handleRestoreSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold">Yönetici Şifreniz</label>
                <Input 
                  type="password" 
                  required 
                  value={restorePassword}
                  onChange={e => setRestorePassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Onaylamak için <strong>BACKUP</strong> yazın</label>
                <Input 
                  type="text" 
                  required 
                  placeholder="BACKUP"
                  value={restoreConfirmText}
                  onChange={e => setRestoreConfirmText(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
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
    </div>
  )
}
