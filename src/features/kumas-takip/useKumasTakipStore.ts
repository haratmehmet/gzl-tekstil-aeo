import { useState, useEffect } from "react"
import { KumasTakipSheet } from "./components/kumas-takip-form"

export function useKumasTakipStore() {
  const [sheets, setSheets] = useState<KumasTakipSheet[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchSheets = async () => {
    try {
      const res = await fetch("/api/kumas-takip")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setSheets(data)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    fetchSheets()
  }, [])

  const saveSheet = async (sheet: KumasTakipSheet): Promise<KumasTakipSheet | null> => {
    try {
      const exists = sheets.some((s) => s.id === sheet.id)
      
      const res = await fetch("/api/kumas-takip", {
        method: exists ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sheet),
      })

      if (!res.ok) throw new Error("Failed to save")
      
      const savedSheet: KumasTakipSheet = await res.json()
      
      // Tüm veritabanını tekrar indirip bekletmek yerine state'i anında güncelle (0ms gecikme)
      setSheets((prev) => {
        const index = prev.findIndex((s) => s.id === savedSheet.id || s.id === sheet.id)
        if (index >= 0) {
          const next = [...prev]
          next[index] = savedSheet
          return next
        }
        return [savedSheet, ...prev]
      })
      
      return savedSheet
    } catch (error) {
      console.error("Save error:", error)
      alert("Kaydedilirken bir hata oluştu.")
      return null
    }
  }

  const deleteSheet = async (id: string) => {
    try {
      // Listeden anında kaldır
      setSheets((prev) => prev.filter((s) => s.id !== id))
      
      const res = await fetch(`/api/kumas-takip?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
    } catch (error) {
      console.error("Delete error:", error)
      alert("Silinirken bir hata oluştu.")
      await fetchSheets()
    }
  }

  return {
    sheets,
    isLoaded,
    saveSheet,
    deleteSheet,
  }
}
