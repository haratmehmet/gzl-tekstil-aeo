"use client"

import React from "react"
import { useKesimKontrol } from "../kesim-kontrol-store"
import { Plus, Scissors, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function KesimKontrolList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const { records, isLoading, deleteRecord, addRecord } = useKesimKontrol()

  const handleAddNew = async () => {
    // 4 empty kumas rows
    const emptyKumaslar = Array(4).fill(null).map(() => ({
      kodu: "", kullanimYeri: "", birimMetre: "", kumasciFirma: ""
    }))
    // 8 empty beden rows
    const emptyBedenler = {
      headers: ["34 / XS", "36 / S", "38 / M", "40 / L", "42 / XL", "44 / XXL"],
      rows: Array(8).fill(null).map(() => ({
        id: Math.random().toString(36).substring(7),
        kumasTuru: "",
        values: {
          "34 / XS": "",
          "36 / S": "",
          "38 / M": "",
          "40 / L": "",
          "42 / XL": "",
          "44 / XXL": ""
        },
        toplamAdet: "",
        kesilenMt: ""
      }))
    }

    try {
      const newRec = await addRecord({
        modelKodu: "",
        kesimTarihi: "",
        sezonMarka: "",
        sapKodu: "",
        notlar: "",
        kumaslar: emptyKumaslar,
        bedenler: emptyBedenler,
      })
      if (newRec) {
        onSelect(newRec.id)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-neutral-500 text-sm">Yükleniyor...</div>
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200">
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
        <h2 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
          <Scissors className="h-4 w-4 text-orange-500" />
          Kayıtlı Föyler
        </h2>
        <Button onClick={handleAddNew} size="sm" variant="outline" className="h-8 text-xs font-semibold">
          <Plus className="h-3.5 w-3.5 mr-1" /> Yeni Ekle
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {records.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-400">Henüz föy bulunmuyor.</div>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`p-3 rounded-md cursor-pointer transition-colors border group ${
                selectedId === r.id
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-transparent hover:border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm text-neutral-800">
                    {r.modelKodu || "İsimsiz Model"}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {r.kesimTarihi || "Tarih Yok"}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
                      deleteRecord(r.id)
                      if (selectedId === r.id) onSelect(null)
                    }
                  }}
                  className="text-neutral-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
