import { useState, useEffect } from "react"
import { KumasDeposu } from "@prisma/client"

export type KumasDeposuRecord = KumasDeposu

export function useKumasDeposu() {
  const [records, setRecords] = useState<KumasDeposuRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/kumas-deposu")
      const data = await res.json()
      if (Array.isArray(data)) {
        setRecords(data)
      } else {
        console.error("API did not return an array:", data)
        setRecords([])
      }
    } catch (error) {
      console.error("Fetch kumas-deposu error:", error)
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const updateRecord = async (id: string, updates: Partial<KumasDeposuRecord>) => {
    try {
      const existing = records.find(r => r.id === id)
      if (!existing) return

      // Optimistic Update
      const newRecordState = { ...existing, ...updates }
      
      // Auto calculate net metraj if harcananMetraj changed
      if (updates.harcananMetraj !== undefined) {
        const gelen = parseFloat(newRecordState.gelenMetraj.replace(',', '.').replace(/[^0-9.]/g, '')) || 0
        const harcanan = parseFloat(newRecordState.harcananMetraj.replace(',', '.').replace(/[^0-9.]/g, '')) || 0
        const net = gelen - harcanan
        const isKg = newRecordState.gelenMetraj.toLowerCase().includes("kg")
        newRecordState.netMetraj = `${net.toFixed(2).replace('.', ',')} ${isKg ? "Kg" : "Mt"}`
      }

      setRecords(prev => prev.map(r => r.id === id ? newRecordState : r))

      // Background sync
      fetch("/api/kumas-deposu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecordState),
      }).catch(err => console.error("Background sync error:", err))

    } catch (error) {
      console.error("Update error:", error)
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      // Optimistic Delete
      setRecords(prev => prev.filter(r => r.id !== id))
      const res = await fetch(`/api/kumas-deposu?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        // Reload if delete failed
        fetchRecords()
      }
    } catch (error) {
      console.error("Delete error:", error)
      fetchRecords()
    }
  }

  const addEmptyRecord = async (parentId?: string) => {
    try {
      let baseRecord: Partial<KumasDeposuRecord> = {}
      
      // If we are adding a sub-row from a parent
      if (parentId) {
        const parent = records.find(r => r.id === parentId)
        if (parent) {
          baseRecord = {
            tarih: parent.kesimTarihi || parent.tarih, // KESİM TARİHİ YENİ TARİH OLARAK EKLENİR
            renk: parent.renk,
            firma: parent.firma,
            sezon: parent.sezon,
            kumasKodu: parent.kumasKodu,
            // the new incoming is the parent's net amount
            gelenMetraj: parent.netMetraj, 
            netMetraj: parent.netMetraj,
            parentId: parent.id,
            takipFoyuId: parent.takipFoyuId
          }
        }
      }

      const newRecord = {
        tarih: "",
        renk: "",
        firma: "",
        sezon: "",
        kumasKodu: "",
        gelenMetraj: "",
        kesimTarihi: "",
        baglananModel: "",
        kesilenAdet: "",
        aciklama: "",
        harcananMetraj: "",
        netMetraj: "",
        ...baseRecord
      }

      const res = await fetch("/api/kumas-deposu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord)
      })
      if (!res.ok) throw new Error("Failed to add")
      const saved = await res.json()
      setRecords(prev => [...prev, saved])
    } catch (error) {
      console.error("Add empty error:", error)
    }
  }

  return {
    records,
    isLoaded,
    updateRecord,
    deleteRecord,
    addEmptyRecord,
  }
}
