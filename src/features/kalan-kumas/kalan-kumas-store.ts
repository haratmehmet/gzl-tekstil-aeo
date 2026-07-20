import { useState, useEffect } from "react"

export interface KalanKumasRecord {
  id: string
  faturaNo: string
  malzemeKodu: string
  faturaTarih: string
  birimFiyat: number | ""
  depoyaGirisTarihi: string
  kumasKodu: string
  kumasMetraji: string
  takipFoyuId?: string
  notlar?: { aciklama: string; kesilenMt: string; kalanMt: string }
}

// Global helper for sync from tracking sheet
export async function syncKumasToKalanKumas(payload: Omit<KalanKumasRecord, "id">) {
  try {
    const res = await fetch("/api/kalan-kumas")
    const records: KalanKumasRecord[] = await res.json()
    
    if (payload.takipFoyuId) {
      const existing = records.find(r => r.takipFoyuId === payload.takipFoyuId)
      if (existing) {
        await fetch("/api/kalan-kumas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...existing,
            depoyaGirisTarihi: payload.depoyaGirisTarihi || existing.depoyaGirisTarihi,
            kumasKodu: payload.kumasKodu || existing.kumasKodu,
            kumasMetraji: payload.kumasMetraji || existing.kumasMetraji,
          })
        })
        return
      }
    }

    await fetch("/api/kalan-kumas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error("Sync error:", error)
  }
}

export function useKalanKumas() {
  const [records, setRecords] = useState<KalanKumasRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/kalan-kumas")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRecords(data)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const updateRecord = async (id: string, updates: Partial<KalanKumasRecord>) => {
    try {
      const existing = records.find(r => r.id === id)
      if (!existing) return

      // Optimistic update kaldırıldı, taze veri çekilecek
      await fetch("/api/kalan-kumas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...existing, ...updates }),
      })
      
      await fetchRecords()
    } catch (error) {
      console.error("Update error:", error)
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/kalan-kumas?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete")
      await fetchRecords()
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const addEmptyRecord = async () => {
    try {
      const newRecord = {
        faturaNo: "",
        malzemeKodu: "",
        faturaTarih: "",
        birimFiyat: null,
        depoyaGirisTarihi: "",
        kumasKodu: "",
        kumasMetraji: "",
      }
      const res = await fetch("/api/kalan-kumas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord)
      })
      if (!res.ok) throw new Error("Failed to add")
      await fetchRecords()
    } catch (error) {
      console.error("Add empty error:", error)
    }
  }

  const syncPastSheets = async () => {
    try {
      // Fetch current kumas-takip sheets from DB
      const resSheets = await fetch("/api/kumas-takip")
      const sheets = await resSheets.json()

      let addedCount = 0
      for (const sheet of sheets) {
        if (records.some(r => r.takipFoyuId === sheet.id)) {
          continue
        }
        
        await fetch("/api/kalan-kumas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            faturaNo: "",
            malzemeKodu: "",
            faturaTarih: "",
            birimFiyat: null,
            depoyaGirisTarihi: sheet.geldigiTarih || "",
            kumasKodu: sheet.kumasKodu || "",
            kumasMetraji: `${sheet.gelenMetraj} ${sheet.birim === 'KG' ? 'Kg' : 'Mt'}`,
            takipFoyuId: sheet.id,
          })
        })
        addedCount++
      }

      if (addedCount > 0) {
        await fetchRecords()
      }
      return addedCount
    } catch (error) {
      console.error("Sync past error:", error)
      return 0
    }
  }

  return {
    records,
    isLoaded,
    updateRecord,
    deleteRecord,
    addEmptyRecord,
    syncPastSheets,
  }
}
