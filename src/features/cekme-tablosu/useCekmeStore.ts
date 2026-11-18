import { useState, useEffect } from "react"
import { CekmeFoyu } from "./types"

export function useCekmeStore() {
  const [foyler, setFoyler] = useState<CekmeFoyu[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchFoyler = async () => {
    try {
      const res = await fetch("/api/cekme-tablosu")
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        console.error("Fetch error /api/cekme-tablosu:", errorData?.error || res.statusText)
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setFoyler(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    fetchFoyler()
  }, [])

  const addFoy = async (foy: CekmeFoyu): Promise<boolean> => {
    try {
      const res = await fetch("/api/cekme-tablosu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foy),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to add")
      }
      const newRecord = await res.json().catch(() => null)
      setFoyler(prev => [...prev, newRecord || foy])
      return true
    } catch (error) {
      console.error("Add error:", error)
      alert("Çekme tablosuna kaydedilirken bir hata oluştu.")
      return false
    }
  }

  const updateFoy = async (id: string, updatedFoy: CekmeFoyu): Promise<boolean> => {
    try {
      // Optimistic update — ekranda anında güncellenir (0ms)
      setFoyler(prev => prev.map(f => f.id === id ? updatedFoy : f))

      const res = await fetch("/api/cekme-tablosu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFoy),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to update")
      }
      return true
    } catch (error) {
      console.error("Update error:", error)
      alert("Çekme tablosu güncellenirken bir hata oluştu.")
      return false
    }
  }

  const deleteFoy = async (id: string) => {
    try {
      setFoyler(prev => prev.filter(f => f.id !== id))
      const res = await fetch(`/api/cekme-tablosu?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
    } catch (error) {
      console.error("Delete error:", error)
      alert("Silinirken bir hata oluştu.")
      await fetchFoyler()
    }
  }

  return {
    foyler,
    isLoaded,
    addFoy,
    updateFoy,
    deleteFoy,
  }
}
