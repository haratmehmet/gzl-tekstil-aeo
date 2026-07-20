"use client"

import React from "react"
import { useKumasDeposu, KumasDeposuRecord } from "../kumas-deposu-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToExcel } from "../utils/export-excel"

interface KumasDeposuListProps {
  onEdit: (record: KumasDeposuRecord) => void
}

export function KumasDeposuList({ onEdit }: KumasDeposuListProps) {
  const { records, isLoaded } = useKumasDeposu()

  if (!isLoaded) {
    return <div className="text-sm text-neutral-500 animate-pulse">Yükleniyor...</div>
  }

  const handleDownloadExcel = async () => {
    try {
      await exportToExcel(records)
    } catch (error) {
      console.error("Excel dışa aktarma hatası:", error)
      alert("Excel dosyası oluşturulurken bir hata oluştu.")
    }
  }

  return (
    <div className="space-y-4">
      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button onClick={handleDownloadExcel} variant="outline" className="gap-2 bg-white text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
          <Download className="h-4 w-4" />
          Excel İndir
        </Button>
      </div>

      {/* YELLOW HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden print:border-neutral-300 print:shadow-none mb-2">
        <div className="grid grid-cols-4 border-b border-neutral-300">
          <div className="col-span-1 bg-yellow-400 font-extrabold text-neutral-900 border-r border-neutral-300 px-4 py-3 flex items-center justify-center text-xs tracking-wider uppercase text-center print:text-[10px] print:bg-yellow-400">
            GZL TEKSTİL
          </div>
          <div className="col-span-3 bg-yellow-300 font-black text-neutral-900 px-4 py-3 flex items-center justify-center text-sm tracking-widest uppercase text-center print:text-xs print:bg-yellow-300">
            KUMAŞ DEPOSU
          </div>
        </div>
      </div>

    <Card className="border-neutral-200 shadow-sm bg-white overflow-hidden">

      <CardContent className="p-0">
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto print:block print:overflow-visible">
          <div className="min-w-[1500px] print:w-[1500px] print:scale-[0.68] print:origin-top-left print:mb-[-30%]">
            <table className="w-full text-left border-collapse cursor-pointer">
            <thead>
              <tr className="text-[10px] font-bold text-center uppercase whitespace-nowrap">
                <th className="bg-sky-200 text-sky-950 px-2 py-3 border border-neutral-300">TARİH</th>
                <th className="bg-sky-200 text-sky-950 px-2 py-3 border border-neutral-300">RENK</th>
                <th className="bg-sky-200 text-sky-950 px-2 py-3 border border-neutral-300">FİRMA</th>
                <th className="bg-sky-200 text-sky-950 px-2 py-3 border border-neutral-300">SEZON</th>
                <th className="bg-sky-200 text-sky-950 px-2 py-3 border border-neutral-300">KUMAŞ KODU</th>
                <th className="bg-sky-200 text-sky-950 px-2 py-3 border border-neutral-300">GELEN METRAJ</th>
                
                <th className="bg-orange-200 text-orange-950 px-2 py-3 border border-neutral-300">KESİM TARİHİ</th>
                <th className="bg-orange-200 text-orange-950 px-2 py-3 border border-neutral-300">BAĞLANAN MODEL</th>
                <th className="bg-orange-200 text-orange-950 px-2 py-3 border border-neutral-300">KESİLEN ADET</th>
                <th className="bg-orange-200 text-orange-950 px-2 py-3 border border-neutral-300">HARCANAN METRAJ</th>
                <th className="bg-orange-200 text-orange-950 px-2 py-3 border border-neutral-300">AÇIKLAMA</th>
                <th className="bg-yellow-400 text-yellow-950 px-2 py-3 border border-neutral-300">NET METRAJ</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-neutral-800 divide-y divide-neutral-200 whitespace-nowrap">
              {Array.isArray(records) && records.map((r, i) => {
                const isChild = !!r.parentId;
                const hasChild = Array.isArray(records) && records.some(child => child.parentId === r.id);
                
                const blueBg = isChild ? "bg-emerald-50" : "bg-sky-50/40";
                const orangeBg = isChild ? "bg-emerald-100/40" : "bg-orange-50/30";
                const yellowBg = isChild ? "bg-emerald-200/60" : "bg-yellow-100/50";
                
                const passiveClass = hasChild ? "opacity-30 grayscale" : "";

                return (
                <tr 
                  key={r.id} 
                  onClick={() => onEdit(r)}
                  className={`hover:bg-neutral-100 transition-all duration-300 cursor-pointer group`}
                >
                  {/* BLUE COLUMNS */}
                  <td className={`p-2 border border-neutral-300 ${blueBg} text-center`}>{r.tarih}</td>
                  <td className={`p-2 border border-neutral-300 ${blueBg} text-center`}>{r.renk}</td>
                  <td className={`p-2 border border-neutral-300 ${blueBg} text-center`}>{r.firma}</td>
                  <td className={`p-2 border border-neutral-300 ${blueBg} text-center`}>{r.sezon}</td>
                  <td className={`p-2 border border-neutral-300 ${blueBg} text-center`}>{r.kumasKodu}</td>
                  <td className={`p-2 border border-neutral-300 ${blueBg} text-center font-bold`}>{r.gelenMetraj}</td>

                  {/* ORANGE COLUMNS */}
                  <td className={`p-2 border border-neutral-300 ${orangeBg} text-center`}>{r.kesimTarihi}</td>
                  <td className={`p-2 border border-neutral-300 ${orangeBg} text-center`}>{r.baglananModel}</td>
                  <td className={`p-2 border border-neutral-300 ${orangeBg} text-center`}>{r.kesilenAdet}</td>
                  <td className={`p-2 border border-neutral-300 ${orangeBg} text-center text-red-600 font-bold`}>{r.harcananMetraj}</td>
                  <td className={`p-2 border border-neutral-300 ${orangeBg} text-center`}>{r.aciklama}</td>

                  {/* YELLOW COLUMN */}
                  <td className={`p-2 border border-neutral-300 ${yellowBg} text-center font-bold text-neutral-900 transition-all duration-300 ${passiveClass}`}>{r.netMetraj}</td>
                </tr>
                );
              })}

              {(!Array.isArray(records) || records.length === 0) && (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-neutral-400 font-normal">
                    Henüz depo kaydı bulunmuyor. Kumaş Takip sayfasından föy kaydettiğinizde buraya otomatik düşecektir.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="grid grid-cols-1 gap-3 p-3 md:hidden print:hidden">
          {Array.isArray(records) && records.map((r) => {
            const isChild = !!r.parentId;
            const hasChild = Array.isArray(records) && records.some(child => child.parentId === r.id);
            const passiveClass = hasChild ? "opacity-30 grayscale" : "";

            return (
            <div 
              key={r.id} 
              onClick={() => onEdit(r)}
              className={`${isChild ? "bg-emerald-50" : "bg-white"} border border-neutral-200 rounded-lg p-4 shadow-sm active:bg-neutral-50 transition-all`}
            >
              <div className="flex justify-between items-start mb-3 pb-3 border-b border-neutral-100">
                <div>
                  <div className="text-xs text-sky-600 font-bold mb-1">{r.tarih}</div>
                  <div className="font-bold text-neutral-900">{r.firma}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{r.renk} • {r.kumasKodu}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">Gelen</div>
                  <div className="text-sm font-black text-sky-700">{r.gelenMetraj}</div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Sezon:</span>
                  <span className="font-medium text-neutral-800">{r.sezon || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Model:</span>
                  <span className="font-medium text-neutral-800">{r.baglananModel || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Kesim:</span>
                  <span className="font-medium text-neutral-800">{r.kesilenAdet ? `${r.kesilenAdet} adet` : "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Harcanan:</span>
                  <span className="font-bold text-red-600">{r.harcananMetraj || "-"}</span>
                </div>
              </div>

              <div className={`pt-3 border-t border-yellow-200 ${isChild ? "bg-emerald-200/50" : "bg-yellow-50/50"} -mx-4 -mb-4 p-4 rounded-b-lg flex justify-between items-center transition-all duration-300 ${passiveClass}`}>
                <span className="text-xs font-black text-yellow-900 uppercase">Net Kalan</span>
                <span className="text-lg font-black text-neutral-900">{r.netMetraj}</span>
              </div>
            </div>
            );
          })}

          {(!Array.isArray(records) || records.length === 0) && (
            <div className="text-center py-8 text-neutral-400 text-sm">
              Henüz depo kaydı bulunmuyor.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
