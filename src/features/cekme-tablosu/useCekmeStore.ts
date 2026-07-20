import { useState, useEffect } from "react"
import { CekmeFoyu } from "./types"

export function useCekmeStore() {
  const [foyler, setFoyler] = useState<CekmeFoyu[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchFoyler = async () => {
    try {
      const res = await fetch("/api/cekme-tablosu")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setFoyler(data)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    fetchFoyler()
  }, [])

  const addFoy = async (foy: CekmeFoyu) => {
    try {
      const res = await fetch("/api/cekme-tablosu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foy),
      })
      if (!res.ok) throw new Error("Failed to add")
      const newFoy = await res.json()
      setFoyler((prev) => [...prev, newFoy])
    } catch (error) {
      console.error("Add error:", error)
      alert("Kaydedilirken bir hata oluştu.")
    }
  }

  const updateFoy = async (id: string, updatedFoy: CekmeFoyu) => {
    try {
      const res = await fetch("/api/cekme-tablosu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFoy),
      })
      if (!res.ok) throw new Error("Failed to update")
      const savedFoy = await res.json()
      setFoyler((prev) => prev.map((f) => (f.id === id ? savedFoy : f)))
    } catch (error) {
      console.error("Update error:", error)
      alert("Güncellenirken bir hata oluştu.")
    }
  }

  const deleteFoy = async (id: string) => {
    try {
      const res = await fetch(`/api/cekme-tablosu?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      setFoyler((prev) => prev.filter((f) => f.id !== id))
    } catch (error) {
      console.error("Delete error:", error)
      alert("Silinirken bir hata oluştu.")
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
