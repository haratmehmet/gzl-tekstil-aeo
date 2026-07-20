"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { KumasTakipSheet } from "./kumas-takip-form"
import { Search, Calendar, FileText, ChevronRight, ChevronDown, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KumasTakipListProps {
  sheets: KumasTakipSheet[]
  onSelect: (sheet: KumasTakipSheet) => void
  onDelete: (id: string) => void
  activeId?: string
}

export function KumasTakipList({ sheets, onSelect, onDelete, activeId }: KumasTakipListProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [expandedSeasons, setExpandedSeasons] = React.useState<Record<string, boolean>>({})
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

  // Filter sheets by fabric code, supplier company, model, sap code, or amount with unit
  const filteredSheets = React.useMemo(() => {
    return sheets.filter((sheet) => {
      const term = searchTerm.toLowerCase().trim()
      if (!term) return true

      const matchKodu = sheet.kumasKodu.toLowerCase().includes(term)
      const matchFirma = sheet.kumasciFirma.toLowerCase().includes(term)
      const matchModel = sheet.baglandigiModel.toLowerCase().includes(term)
      const matchSap = sheet.sapKodu ? sheet.sapKodu.toLowerCase().includes(term) : false

      // Match raw numbers or formatted amounts (e.g. "150", "150 mt", "150,00 kg")
      const amountStr1 = `${sheet.gelenMetraj.toFixed(0)} ${sheet.birim === "MT" ? "mt" : "kg"}`.toLowerCase()
      const amountStr2 = `${sheet.gelenMetraj.toFixed(2).replace('.', ',')} ${sheet.birim === "MT" ? "mt" : "kg"}`.toLowerCase()
      const matchAmount = amountStr1.includes(term) || amountStr2.includes(term)

      return matchKodu || matchFirma || matchModel || matchSap || matchAmount
    })
  }, [sheets, searchTerm])
  // Group by season
  const groupedSheets = React.useMemo(() => {
    const groups: Record<string, KumasTakipSheet[]> = {}
    filteredSheets.forEach((sheet) => {
      const season = sheet.sezon || "Sezon Yok"
      if (!groups[season]) groups[season] = []
      groups[season].push(sheet)
    })
    return groups
  }, [filteredSheets])

  // Initialize expanded state: Bütün sezonlar varsayılan olarak kapalı kalsın (kullanıcı talebi)
  // React.useEffect() otomatik açma işlemi iptal edildi.

  const toggleSeason = (season: string) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [season]: !prev[season]
    }))
  }

  return (
    <Card className="border border-neutral-200/80 bg-white shadow-sm shadow-neutral-100/30 rounded-2xl h-full flex flex-col min-h-[500px]">
      <CardHeader className="pb-3 select-none">
        <CardTitle className="text-base font-bold text-neutral-800">
          Kayıtlı Föyler
        </CardTitle>
        <CardDescription className="text-xs text-neutral-400">
          Sistemde kayıtlı kumaş takip föylerinin listesi.
        </CardDescription>
        
        {/* Search bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Kodu, model veya firma ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs border-neutral-200 focus-visible:ring-neutral-400 bg-neutral-50/30"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredSheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 select-none">
            <div className="p-3.5 bg-neutral-50 rounded-full text-neutral-400 mb-3 border border-neutral-100">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-neutral-600">Föy Bulunamadı</p>
            <p className="text-[10px] text-neutral-400 max-w-[200px] mt-1.5 leading-relaxed">
              Aradığınız kriterlere uygun kayıtlı takip föyü bulunmamaktadır.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedSheets).sort().map((season) => {
              const isExpanded = expandedSeasons[season]
              return (
              <div key={season} className="space-y-2.5">
                <div 
                  onClick={() => toggleSeason(season)}
                  className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b border-neutral-100 flex items-center justify-between cursor-pointer hover:bg-neutral-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-sky-500 rounded-full group-hover:bg-sky-400 transition-colors"></div>
                    <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest">{season}</h3>
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-md">
                      {groupedSheets[season].length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                  )}
                </div>
                
                {isExpanded && (
                  <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                    {groupedSheets[season].map((sheet) => {
                      const isActive = activeId === sheet.id
                  const hasVariance = sheet.rolls.some(r => r.eksikFazlaMetraj !== 0)
                  const totalVariance = sheet.rolls.reduce((sum, r) => sum + (r.cikanMt === "" ? 0 : r.cikanMt) - r.topUstundeYazanMt, 0)

                  return (
                    <div
                      key={sheet.id}
                      onClick={() => onSelect(sheet)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none group/item ${
                        isActive
                          ? "border-neutral-900 bg-neutral-900/[0.02] shadow-sm shadow-neutral-100"
                          : "border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/50 bg-white"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        {/* Header info */}
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-neutral-800 tracking-tight shrink-0">
                            {sheet.kumasKodu}
                          </span>
                          {sheet.sapKodu && (
                            <span className="text-[9px] font-bold text-neutral-400 uppercase bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                              {sheet.sapKodu}
                            </span>
                          )}
                          {sheet.kullanildigiYer && (
                            <span className="text-[9px] font-bold text-sky-600 uppercase bg-sky-50 px-1.5 py-0.5 rounded shrink-0">
                              {sheet.kullanildigiYer}
                            </span>
                          )}
                        </div>
                        {/* Secondary info */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-neutral-400 font-medium min-w-0">
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="h-3 w-3" />
                            {sheet.geldigiTarih ? new Date(sheet.geldigiTarih).toLocaleDateString('tr-TR') : "-"}
                          </span>
                          <span className="text-neutral-300">&bull;</span>
                          <span className="truncate max-w-[120px] shrink-0" title={sheet.kumasciFirma}>
                            {sheet.kumasciFirma || "Firma Belirtilmemiş"}
                          </span>
                        </div>
                      </div>

                      {/* Metraj Summary side */}
                      <div className="flex items-center gap-3 shrink-0 pl-3">
                        <div className="text-right space-y-0.5">
                          <p className="text-xs font-bold text-neutral-800">
                            {sheet.gelenMetraj.toFixed(0).replace('.', ',')} {sheet.birim === "MT" ? "mt" : "kg"}
                          </p>
                          <p className="text-[9px] font-bold text-neutral-400">
                            {sheet.topAdedi} Top
                          </p>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center relative shrink-0">
                          <ChevronRight className={`h-4 w-4 absolute transition-all duration-200 group-hover/item:opacity-0 group-hover/item:scale-75 ${
                            isActive ? "text-neutral-900 translate-x-0.5" : "text-neutral-300"
                          }`} />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirmId(sheet.id)
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md absolute opacity-0 scale-75 group-hover/item:opacity-100 group-hover/item:scale-100 transition-all duration-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                </div>
                )}
              </div>
            )})}
          </div>
        )}
      </CardContent>

      {/* Custom Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 max-w-sm w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-800">Föyü Silmek İstiyor musunuz?</h4>
                <p className="text-xs text-neutral-500 leading-relaxed text-left">
                  Bu kumaş takip föyü silinecektir. Bu işlemle birlikte **kalan kumaş stoğu** ve **çekme tablosundaki** ilişkili tüm kayıtlar da kalıcı olarak silinir.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="h-8 text-xs font-semibold rounded-xl border-neutral-200 hover:bg-neutral-50"
              >
                Vazgeç
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(deleteConfirmId)
                  setDeleteConfirmId(null)
                }}
                className="h-8 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white"
              >
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
