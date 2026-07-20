"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

export interface UretimTakipBeden {
  beden: string
  bedenAdi: string
  kesilenAdet: string
  ikiKaliteAdet: string
  netAdet: string
}

export interface UretimTakipRecord {
  id: string
  modelKodu: string
  sezon: string
  etiket: string
  sapKodu: string
  kumasKodu: string
  kumasIcerik: string
  kesimTarihi: string
  dikimBaslangicTarihi: string
  paketlemeTarihi: string
  bedenler: UretimTakipBeden[]
  // Alt bölüm
  kesilenMetraj: string
  etiketBilgi: string
  numara: string
  barkodTalimat: string
  fiyatSticker: string
  kkDurumu: string
  sevkDurumu: string
  notKritik: string
}

interface UretimTakipContextType {
  records: UretimTakipRecord[]
  isLoading: boolean
  error: string | null
  fetchRecords: () => Promise<void>
  addRecord: (record: Omit<UretimTakipRecord, "id">) => Promise<UretimTakipRecord>
  updateRecord: (id: string, record: Partial<UretimTakipRecord>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

const UretimTakipContext = createContext<UretimTakipContextType | null>(null)

export function useUretimTakip() {
  const ctx = useContext(UretimTakipContext)
  if (!ctx) throw new Error("useUretimTakip must be used within UretimTakipProvider")
  return ctx
}

const DEFAULT_BEDENLER: UretimTakipBeden[] = [
  { beden: "34", bedenAdi: "XS",  kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
  { beden: "36", bedenAdi: "S",   kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
  { beden: "38", bedenAdi: "M",   kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
  { beden: "40", bedenAdi: "L",   kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
  { beden: "42", bedenAdi: "XL",  kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
  { beden: "44", bedenAdi: "XXL", kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
  { beden: "46", bedenAdi: "3XL", kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
  { beden: "48", bedenAdi: "4XL", kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" },
]

export const DEFAULT_FORM: UretimTakipRecord = {
  id: "",
  modelKodu: "", sezon: "", etiket: "",
  sapKodu: "", kumasKodu: "", kumasIcerik: "",
  kesimTarihi: "", dikimBaslangicTarihi: "", paketlemeTarihi: "",
  bedenler: DEFAULT_BEDENLER.map(b => ({ ...b })),
  kesilenMetraj: "", etiketBilgi: "", numara: "",
  barkodTalimat: "", fiyatSticker: "", kkDurumu: "", sevkDurumu: "",
  notKritik: "",
}

export function UretimTakipProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<UretimTakipRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/uretim-takip")
      if (!res.ok) throw new Error("Kayıtlar getirilemedi")
      const data = await res.json()
      setRecords(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addRecord = useCallback(async (record: Omit<UretimTakipRecord, "id">) => {
    try {
      const res = await fetch("/api/uretim-takip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.details || err.error || "Kayıt eklenemedi")
      }
      const newRecord = await res.json()
      setRecords(prev => [newRecord, ...prev])
      return newRecord
    } catch (err: any) {
      setError(err.message); throw err
    }
  }, [])

  const updateRecord = useCallback(async (id: string, record: Partial<UretimTakipRecord>) => {
    try {
      const res = await fetch(`/api/uretim-takip/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
      if (!res.ok) throw new Error("Kayıt güncellenemedi")
      const updated = await res.json()
      setRecords(prev => prev.map(r => (r.id === id ? updated : r)))
    } catch (err: any) { setError(err.message) }
  }, [])

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/uretim-takip/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Kayıt silinemedi")
      setRecords(prev => prev.filter(r => r.id !== id))
    } catch (err: any) { setError(err.message) }
  }, [])

  return (
    <UretimTakipContext.Provider value={{ records, isLoading, error, fetchRecords, addRecord, updateRecord, deleteRecord }}>
      {children}
    </UretimTakipContext.Provider>
  )
}
