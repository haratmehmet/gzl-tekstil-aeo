"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

export interface KesimKontrolKumas {
  kodu: string
  kullanimYeri: string
  birimMetre: string
  kumasciFirma: string
}

export interface KesimKontrolBeden {
  id?: string
  kumasTuru: string
  values: Record<string, string>
  toplamAdet: string
  kesilenMt: string
}

export interface BedenTablosu {
  headers: string[]
  rows: KesimKontrolBeden[]
}

export interface KesimKontrolRecord {
  id: string
  modelKodu: string
  kesimTarihi: string
  sezonMarka: string
  sapKodu: string
  notlar: string
  kumaslar: KesimKontrolKumas[]
  bedenler: BedenTablosu
  createdAt?: string
  updatedAt?: string
}

interface KesimKontrolContextType {
  records: KesimKontrolRecord[]
  isLoading: boolean
  error: string | null
  fetchRecords: () => Promise<void>
  addRecord: (record: Omit<KesimKontrolRecord, "id">) => Promise<KesimKontrolRecord>
  updateRecord: (id: string, record: Partial<KesimKontrolRecord>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

const KesimKontrolContext = createContext<KesimKontrolContextType | undefined>(undefined)

// Geriye dönük uyumluluk için normalize fonksiyonu
function normalizeBedenler(bedenler: any): BedenTablosu {
  if (!bedenler) return { headers: ["34 / XS", "36 / S", "38 / M", "40 / L", "42 / XL", "44 / XXL"], rows: [] }
  if (Array.isArray(bedenler)) {
    return {
      headers: ["34 / XS", "36 / S", "38 / M", "40 / L", "42 / XL", "44 / XXL"],
      rows: bedenler.map(b => ({
        id: Math.random().toString(36).substring(7),
        kumasTuru: b.kumasTuru || "",
        values: {
          "34 / XS": b.xs || "",
          "36 / S": b.s || "",
          "38 / M": b.m || "",
          "40 / L": b.l || "",
          "42 / XL": b.xl || "",
          "44 / XXL": b.xxl || ""
        },
        toplamAdet: b.toplamAdet || "",
        kesilenMt: b.kesilenMt || ""
      }))
    }
  }
  const addSlash = (str: string) => {
    if (str.includes('/')) return str;
    // baştaki ve sondaki boşlukları yok sayarak eşleştir
    return str.replace(/^\s*(\d+)\s*([A-Za-z]+)\s*$/, "$1 / $2");
  }

  const b = bedenler as BedenTablosu
  if (b.headers) {
    b.headers = b.headers.map(h => addSlash(h))
  }
  if (b.rows) {
    b.rows = b.rows.map(row => {
      if (!row.values) return row
      const newValues: Record<string, string> = {}
      for (const [key, val] of Object.entries(row.values)) {
        newValues[addSlash(key)] = val as string
      }
      return { ...row, values: newValues }
    })
  }
  return b
}

export function KesimKontrolProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<KesimKontrolRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/kesim-kontrol")
      if (!res.ok) throw new Error("Kayıtlar getirilemedi")
      const data = await res.json()
      
      const normalizedData = data.map((item: any) => ({
        ...item,
        bedenler: normalizeBedenler(item.bedenler)
      }))
      
      setRecords(normalizedData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addRecord = useCallback(async (record: Omit<KesimKontrolRecord, "id">) => {
    try {
      const res = await fetch("/api/kesim-kontrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || "Kayıt eklenemedi")
      }
      const newRecord = await res.json()
      setRecords((prev) => [newRecord, ...prev])
      return newRecord
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateRecord = useCallback(async (id: string, record: Partial<KesimKontrolRecord>) => {
    try {
      const res = await fetch(`/api/kesim-kontrol/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
      if (!res.ok) throw new Error("Kayıt güncellenemedi")
      const updated = await res.json()
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/kesim-kontrol/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Kayıt silinemedi")
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  return (
    <KesimKontrolContext.Provider
      value={{
        records,
        isLoading,
        error,
        fetchRecords,
        addRecord,
        updateRecord,
        deleteRecord,
      }}
    >
      {children}
    </KesimKontrolContext.Provider>
  )
}

export function useKesimKontrol() {
  const context = useContext(KesimKontrolContext)
  if (context === undefined) {
    throw new Error("useKesimKontrol must be used within a KesimKontrolProvider")
  }
  return context
}
