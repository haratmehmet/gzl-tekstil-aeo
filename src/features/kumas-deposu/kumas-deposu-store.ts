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

  const parseMetraj = (val: string) => {
    if (!val) return 0;
    let clean = val.replace(/[^0-9.,-]/g, '');
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    return parseFloat(clean) || 0;
  }

  const updateRecord = async (id: string, updates: Partial<KumasDeposuRecord>) => {
    try {
      const existing = records.find(r => r.id === id)
      if (!existing) return

      // Optimistic Update
      const newRecordState = { ...existing, ...updates }
      
      // Auto calculate net metraj if harcananMetraj changed
      if (updates.harcananMetraj !== undefined) {
        const gelen = parseMetraj(newRecordState.gelenMetraj)
        const harcanan = parseMetraj(newRecordState.harcananMetraj)
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

  const addEmptyRecord = async (parentId?: string, parentDataOverrides?: Partial<KumasDeposuRecord>) => {
    try {
      let baseRecord: Partial<KumasDeposuRecord> = {}
      
      // If we are adding a sub-row from a parent
      if (parentId) {
        const parent = records.find(r => r.id === parentId)
        if (parent) {
          const actualParent = { ...parent, ...(parentDataOverrides || {}) }
          baseRecord = {
            tarih: actualParent.kesimTarihi || actualParent.tarih, // KESİM TARİHİ YENİ TARİH OLARAK EKLENİR
            renk: actualParent.renk,
            firma: actualParent.firma,
            sezon: actualParent.sezon,
            kumasKodu: actualParent.kumasKodu,
            baglananModel: actualParent.baglananModel, // BAĞLANAN MODEL ALT SATIRA AKTARILIR
            // the new incoming is the parent's net amount
            gelenMetraj: actualParent.netMetraj, 
            netMetraj: actualParent.netMetraj,
            parentId: actualParent.id,
            takipFoyuId: actualParent.takipFoyuId
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
