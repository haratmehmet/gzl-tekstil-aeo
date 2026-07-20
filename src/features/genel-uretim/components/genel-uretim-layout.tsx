"use client"

import React from "react"
import { Plus, Trash2, ChevronDown } from "lucide-react"
import { getUretimSezonlar, addUretimSezon, deleteUretimSezon } from "../actions"
import { GenelUretimTable } from "./genel-uretim-table"

export function GenelUretimLayout() {
  const [sezonlar, setSezonlar] = React.useState<any[]>([])
  const [activeSezonId, setActiveSezonId] = React.useState<string | null>(null)
  const [newSezonName, setNewSezonName] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"academia" | "beymen">("academia")
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  React.useEffect(() => {
    const savedTab = localStorage.getItem("genelUretimTab") as "academia" | "beymen"
    if (savedTab) setActiveTab(savedTab)
    loadSezonlar()
  }, [])

  const loadSezonlar = async () => {
    const res = await getUretimSezonlar()
    if (res.success && res.data) {
      setSezonlar(res.data)
      const savedSezonId = localStorage.getItem("genelUretimSezonId")
      if (savedSezonId && res.data.find(s => s.id === savedSezonId)) {
        setActiveSezonId(savedSezonId)
      } else if (res.data.length > 0 && !activeSezonId) {
        setActiveSezonId(res.data[0].id)
      }
    }
  }

  // Update localStorage whenever these change
  React.useEffect(() => {
    if (activeSezonId) localStorage.setItem("genelUretimSezonId", activeSezonId)
  }, [activeSezonId])

  React.useEffect(() => {
    localStorage.setItem("genelUretimTab", activeTab)
  }, [activeTab])

  const handleAddSezon = async () => {
    try {
      if (!newSezonName.trim()) {
        alert("Lütfen bir sezon adı girin! (Örn: FW26)");
        return;
      }
      const res = await addUretimSezon(newSezonName)
      if (res.success) {
        setNewSezonName("")
        loadSezonlar()
        if (res.data) {
          setActiveSezonId(res.data.id)
        }
      } else {
        console.error(res.error)
        alert("Veritabanı Hatası: " + res.error)
      }
    } catch (err: any) {
      console.error("Sunucu Hatası:", err)
      alert("Sunucuya bağlanılamadı veya beklenmeyen bir hata oluştu: " + err.message)
    }
  }

  const handleDeleteSezon = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm("Bu sezonu silmek istediğinize emin misiniz? (İçindeki tablolar da silinecektir)")) return
    const res = await deleteUretimSezon(id)
    if (res.success) {
      if (activeSezonId === id) setActiveSezonId(null)
      loadSezonlar()
    }
  }

  const activeSezon = sezonlar.find(s => s.id === activeSezonId)

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
      {/* ÜST BAR (Sezon & Sekmeler) */}
      <div className="flex flex-col md:flex-row border-b border-neutral-200 bg-neutral-50/50">
        
        {/* Sol Kısım: Sezon Seçici */}
        <div className="w-full md:w-72 p-3 border-b md:border-b-0 md:border-r border-neutral-200 flex items-center gap-2">
          <div className="relative flex-1">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-lg flex items-center justify-between text-xs font-bold text-neutral-800 shadow-sm hover:bg-neutral-50 transition-colors"
            >
              <span className="truncate">{activeSezon ? activeSezon.ad : "Sezon Seçiniz"}</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 shadow-lg rounded-xl z-50 overflow-hidden">
                <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                  {sezonlar.map((sezon) => (
                    <div 
                      key={sezon.id}
                      onClick={() => { setActiveSezonId(sezon.id); setIsDropdownOpen(false) }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        activeSezonId === sezon.id ? "bg-indigo-50 text-indigo-900" : "hover:bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      <span className="text-[11px] font-bold">{sezon.ad}</span>
                      <button onClick={(e) => handleDeleteSezon(sezon.id, e)} className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {sezonlar.length === 0 && <div className="p-3 text-[10px] text-center text-neutral-400">Sezon bulunamadı.</div>}
                </div>
                <div className="p-2 border-t border-neutral-100 bg-neutral-50 flex gap-2">
                  <input 
                    value={newSezonName}
                    onChange={e => setNewSezonName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { handleAddSezon(); setIsDropdownOpen(false); } }}
                    placeholder="Örn. FW26"
                    className="flex-1 h-8 px-2 rounded-md border border-neutral-200 text-[10px] font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => { handleAddSezon(); setIsDropdownOpen(false) }}
                    className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Kısım: Marka Sekmeleri */}
        <div className="flex-1 flex">
          <button
            onClick={() => setActiveTab("academia")}
            className={`flex-1 flex items-center justify-center py-3 text-[11px] font-black uppercase tracking-wider transition-all ${
              activeTab === "academia" 
                ? "bg-white text-neutral-900 shadow-[inset_0_-2px_0_0_#171717]" 
                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50"
            }`}
          >
            Academia / Beymen Collection
          </button>
          <button
            onClick={() => setActiveTab("beymen")}
            className={`flex-1 flex items-center justify-center py-3 text-[11px] font-black uppercase tracking-wider transition-all border-l border-neutral-200 ${
              activeTab === "beymen" 
                ? "bg-white text-neutral-900 shadow-[inset_0_-2px_0_0_#171717]" 
                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50"
            }`}
          >
            Beymen Club
          </button>
        </div>
      </div>

      {/* ALT KISIM (Full Ekran Tablo) */}
      <div className="flex-1 overflow-hidden relative">
        {activeSezon ? (
          <GenelUretimTable 
            key={`${activeSezon.id}-${activeTab}`}
            sezonId={activeSezon.id} 
            markaTipi={activeTab} 
            sezonAd={activeSezon.ad} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-sm font-bold text-neutral-400">Sezon Seçilmedi</h3>
            <p className="text-[11px] text-neutral-400 mt-1">Lütfen üst taraftan bir sezon seçin veya oluşturun.</p>
          </div>
        )}
      </div>
    </div>
  )
}
