"use client"

import * as React from "react"
import { Plus, Download, Ruler, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCekmeStore } from "@/features/cekme-tablosu/useCekmeStore"
import { useKumasTakipStore } from "@/features/kumas-takip/useKumasTakipStore"
import { CekmeList } from "@/features/cekme-tablosu/components/cekme-list"
import { CekmeForm } from "@/features/cekme-tablosu/components/cekme-form"
import { CekmeFoyu } from "@/features/cekme-tablosu/types"
import { exportToExcel } from "@/features/cekme-tablosu/utils/export-excel"

export default function CekmeTablosuPage() {
  const { foyler, isLoaded: isCekmeLoaded, addFoy, updateFoy, deleteFoy } = useCekmeStore()
  const { sheets: takipSheets, isLoaded: isTakipLoaded } = useKumasTakipStore()
  const [activeFilter, setActiveFilter] = React.useState<string>("SS23 - Academia & Beymen Collection")
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingFoy, setEditingFoy] = React.useState<CekmeFoyu | null>(null)

  const getEtiketGroup = (etiket?: string) => {
    if (etiket === "Beymen Club") return "Beymen Club"
    return "Academia & Beymen Collection"
  }

  const availableFilters = React.useMemo(() => {
    const filters = new Set<string>()
    // Çekme föylerindeki sezonlar
    foyler.forEach((f) => {
      if (!f.sezon) return
      const group = getEtiketGroup(f.etiket)
      filters.add(`${f.sezon} - ${group}`)
    })
    // Kumaş takip föylerindeki sezonlar
    takipSheets.forEach((s) => {
      if (!s.sezon) return
      const group = getEtiketGroup(s.etiket)
      filters.add(`${s.sezon} - ${group}`)
    })
    
    if (filters.size === 0) return ["SS23 - Academia & Beymen Collection"]
    return Array.from(filters).sort()
  }, [foyler, takipSheets])

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("cekmeTablosuFilter")
    if (saved) setActiveFilter(saved)
  }, [])

  // Validate or fallback to first available
  React.useEffect(() => {
    if (availableFilters.length > 0 && !availableFilters.includes(activeFilter)) {
      const saved = localStorage.getItem("cekmeTablosuFilter")
      if (saved && availableFilters.includes(saved)) {
        setActiveFilter(saved)
      } else {
        setActiveFilter(availableFilters[0])
      }
    }
  }, [availableFilters, activeFilter])

  // Save to localStorage when changed
  React.useEffect(() => {
    if (activeFilter && availableFilters.includes(activeFilter)) {
      localStorage.setItem("cekmeTablosuFilter", activeFilter)
    }
  }, [activeFilter, availableFilters])

  if (!isCekmeLoaded || !isTakipLoaded) return null

  const filteredFoyler = foyler.filter((f) => {
    if (!f.sezon) return false
    const group = getEtiketGroup(f.etiket)
    return `${f.sezon} - ${group}` === activeFilter
  })

  const handleCreateNew = () => {
    setEditingFoy(null)
    setIsEditing(true)
  }

  const handleEdit = (foy: CekmeFoyu) => {
    setEditingFoy(foy)
    setIsEditing(true)
  }

  const handleSave = (data: CekmeFoyu) => {
    if (editingFoy) {
      updateFoy(data.id, data)
    } else {
      addFoy(data)
    }
    setIsEditing(false)
    setEditingFoy(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingFoy(null)
  }

  const handleDownloadExcel = async () => {
    try {
      await exportToExcel(filteredFoyler, activeFilter)
    } catch (error) {
      console.error("Excel dışa aktarma hatası:", error)
      alert("Excel dosyası oluşturulurken bir hata oluştu.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Çekme Tablosu</h1>
          <p className="text-sm text-neutral-500 mt-1">Sezon bazlı kumaş test ve çekme metrajlarının takibi.</p>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-neutral-300 bg-white hover:bg-neutral-100 hover:text-neutral-900 h-10 px-4 py-2 text-neutral-600">
                  <span className="font-semibold text-neutral-800">{activeFilter}</span>
                  <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-[200px]">
                {availableFilters.map((filter) => (
                  <DropdownMenuItem key={filter} onClick={() => setActiveFilter(filter)} className={activeFilter === filter ? "bg-neutral-100 font-bold" : ""}>
                    {filter}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleDownloadExcel} variant="outline" className="gap-2 bg-white text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
              <Download className="h-4 w-4" />
              Excel İndir
            </Button>
            <Button onClick={handleCreateNew} className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white">
              <Plus className="h-4 w-4" />
              Yeni Kayıt
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        <CekmeForm
          initialData={editingFoy}
          activeSezon={activeFilter.split(" - ")[0] || "SS23"}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-lg shadow-neutral-100/50 overflow-hidden">
          {/* YELLOW HEADER */}
          <div className="grid grid-cols-4 border-b border-neutral-300">
            <div className="col-span-1 bg-yellow-400 font-extrabold text-neutral-900 border-r border-neutral-300 px-4 py-3 flex items-center justify-center text-xs tracking-wider uppercase text-center print:text-[10px]">
              GZL TEKSTİL
            </div>
            <div className="col-span-3 bg-yellow-300 font-black text-neutral-900 px-4 py-3 flex items-center justify-center text-sm tracking-widest uppercase text-center print:text-xs">
              ÇEKME TABLOSU
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <CekmeList
              foyler={filteredFoyler}
              onEdit={handleEdit}
            />
          </div>
        </div>
      )}
    </div>
  )
}
