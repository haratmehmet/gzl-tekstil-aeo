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

  const saveSheet = async (sheet: KumasTakipSheet) => {
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
      
      const savedSheet = await res.json()
      
      // Kayıttan sonra sunucudan taze ve ilişkili tüm veriyi tekrar çek
      await fetchSheets()
    } catch (error) {
      console.error("Save error:", error)
      alert("Kaydedilirken bir hata oluştu.")
    }
  }

  const deleteSheet = async (id: string) => {
    try {
      const res = await fetch(`/api/kumas-takip?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      
      // Silmeden sonra sunucudan taze veriyi çek
      await fetchSheets()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Silinirken bir hata oluştu.")
    }
  }

  return {
    sheets,
    isLoaded,
    saveSheet,
    deleteSheet,
  }
}
