"use client"

import React from "react"
import { useKalanKumas } from "../kalan-kumas-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, DownloadCloud, FileSpreadsheet, Printer, ArrowUpDown, StickyNote } from "lucide-react"
import * as ExcelJS from "exceljs"

function TotalInput({ record, getRowTotal, updateRecord }: { record: any, getRowTotal: any, updateRecord: any }) {
  const computedTotal = getRowTotal(record.kumasMetraji, record.birimFiyat)
  const displayVal = computedTotal === 0 && !record.kumasMetraji ? "" : computedTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  
  const [localVal, setLocalVal] = React.useState<string | null>(null)

  return (
    <input
      type="text"
      value={localVal !== null ? localVal : displayVal}
      onChange={(e) => {
        setLocalVal(e.target.value)
      }}
      onBlur={() => {
        if (localVal === null) return
        if (localVal.trim() === "") {
          const isKg = record.kumasMetraji.toLowerCase().includes("kg")
          updateRecord(record.id, { kumasMetraji: `0 ${isKg ? "Kg" : "Mt"}` })
        } else {
          const valStr = localVal.replace(',', '.')
          const newTotal = parseFloat(valStr)
          
          const f = typeof record.birimFiyat === "number" ? record.birimFiyat : 0
          const mStr = typeof record.kumasMetraji === 'string' ? record.kumasMetraji.replace(',', '.').replace(/[^\d.]/g, '') : '0'
          const m = parseFloat(mStr) || 0
          
          const isKg = typeof record.kumasMetraji === 'string' ? record.kumasMetraji.toLowerCase().includes("kg") : false
          const unit = isKg ? "Kg" : "Mt"
          
          if (!isNaN(newTotal)) {
            if (f > 0) {
              const newM = newTotal / f
              const formattedM = newM.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              updateRecord(record.id, { kumasMetraji: `${formattedM} ${unit}` })
            } else if (m > 0) {
              const newF = newTotal / m
              updateRecord(record.id, { birimFiyat: parseFloat(newF.toFixed(2)) })
            } else {
              updateRecord(record.id, { kumasMetraji: `1 ${unit}`, birimFiyat: parseFloat(newTotal.toFixed(6)) })
            }
          }
        }
        setLocalVal(null)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur()
        }
      }}
      placeholder={displayVal}
      style={{ fontSize: "clamp(9px, 1.1vw, 14px)" }}
      className="relative z-10 w-full h-8 pl-1 pr-4 bg-transparent focus:bg-white text-right font-black text-neutral-900 tracking-tighter"
    />
  )
}

export function KalanKumasTable() {
  const { records, updateRecord, deleteRecord, addEmptyRecord, syncPastSheets } = useKalanKumas()
  const [sortConfig, setSortConfig] = React.useState<{ key: "faturaTarih" | "depoyaGirisTarihi", direction: "asc" | "desc" } | null>(null)
  const [expandedNotes, setExpandedNotes] = React.useState<Record<string, boolean>>({})

  const sortedRecords = React.useMemo(() => {
    let sortableItems = [...records]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aDate = new Date(a[sortConfig.key] || "1970-01-01").getTime()
        const bDate = new Date(b[sortConfig.key] || "1970-01-01").getTime()
        if (aDate < bDate) return sortConfig.direction === "asc" ? -1 : 1
        if (aDate > bDate) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [records, sortConfig])

  const requestSort = (key: "faturaTarih" | "depoyaGirisTarihi") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const parseNumber = (val: string | number) => {
    if (typeof val === "number") return val
    if (!val) return 0
    const cleaned = val.replace(',', '.').replace(/[^0-9.]/g, '')
    return parseFloat(cleaned) || 0
  }

  const getRowTotal = (metraj: string, fiyat: number | "") => {
    const m = parseNumber(metraj)
    const f = typeof fiyat === "number" ? fiyat : 0
    const total = m * f
    return parseFloat(total.toFixed(4))
  }

  const getGrandTotal = () => {
    return records.reduce((acc, r) => acc + getRowTotal(r.kumasMetraji, r.birimFiyat), 0)
  }

  const handleAddRow = () => {
    addEmptyRecord()
  }

  const handleSyncPast = async () => {
    const count = await syncPastSheets()
    if (count !== undefined && count > 0) {
      alert(`${count} adet eski takip föyü başarıyla tabloya aktarıldı.`)
    } else {
      alert("Aktarılacak yeni bir eski föy bulunamadı.")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Kalan Kumaş Stok")

    worksheet.columns = [
      { key: "faturaNo", width: 15 },
      { key: "malzemeKodu", width: 15 },
      { key: "faturaTarih", width: 15 },
      { key: "depoyaGirisTarihi", width: 20 },
      { key: "kumasKodu", width: 20 },
      { key: "kumasMetraji", width: 15 },
      { key: "birimFiyat", width: 15 },
      { key: "toplamTutar", width: 18 },
    ]

    worksheet.mergeCells("A1:B1")
    worksheet.mergeCells("C1:H1")
    const cellA1 = worksheet.getCell("A1")
    cellA1.value = "GZL TEKSTİL"
    cellA1.font = { bold: true, size: 12 }
    cellA1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFACC15" } } 
    cellA1.alignment = { horizontal: "center", vertical: "middle" }

    const cellC1 = worksheet.getCell("C1")
    cellC1.value = "KALAN KUMAŞ STOK TABLOSU"
    cellC1.font = { bold: true, size: 14 }
    cellC1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE047" } } 
    cellC1.alignment = { horizontal: "center", vertical: "middle" }
    
    worksheet.getRow(1).height = 30

    const headerRow = worksheet.addRow([
      "FATURA NO", "MALZEME KODU", "FATURA TARİH", "DEPOYA GİRİŞ TARİHİ", 
      "KUMAŞ KODU", "KUMAŞ METRAJI", "BİRİM FİYAT", "TOPLAM TUTAR"
    ])

    headerRow.eachCell((cell, colNum) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      const isAuto = colNum >= 4 && colNum <= 6
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isAuto ? "FF0EA5E9" : "FFF97316" }
      }
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
    headerRow.height = 25

    records.forEach((r) => {
      worksheet.addRow({
        faturaNo: r.faturaNo,
        malzemeKodu: r.malzemeKodu,
        faturaTarih: r.faturaTarih,
        depoyaGirisTarihi: r.depoyaGirisTarihi,
        kumasKodu: r.kumasKodu,
        kumasMetraji: r.kumasMetraji,
        birimFiyat: typeof r.birimFiyat === "number" ? r.birimFiyat : 0,
        toplamTutar: getRowTotal(r.kumasMetraji, r.birimFiyat)
      })
    })

    worksheet.getColumn("birimFiyat").numFmt = '#,##0.00 "₺"'
    worksheet.getColumn("toplamTutar").numFmt = '#,##0.00 "₺"'

    const lastRow = worksheet.addRow({
      birimFiyat: "TOPLAM TUTAR:",
      toplamTutar: getGrandTotal()
    })
    lastRow.font = { bold: true, color: { argb: "FFFF0000" } }
    lastRow.getCell("toplamTutar").numFmt = '#,##0.00 "₺"'

    worksheet.eachRow((row, rowNum) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Kalan_Kumas_Stok_${new Date().toLocaleDateString("tr-TR")}.xlsx`
    link.click()
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(val)
  }

  return (
    <Card className="border border-neutral-200/80 bg-white shadow-sm shadow-neutral-100/30 rounded-2xl overflow-hidden flex flex-col h-full min-h-[600px]">
      
      <div className="bg-neutral-50 p-3 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-neutral-200 print:hidden">
        <div className="text-xs font-semibold text-neutral-500 px-2 text-center md:text-left">
          Fatura ve depoya giriş kayıtlarınızı buradan takip edebilirsiniz.
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-500 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-neutral-500 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Yazdır
          </button>
          <button
            onClick={handleSyncPast}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-600 border border-neutral-200 text-xs font-bold rounded-lg shadow-sm hover:bg-neutral-50 transition-colors"
          >
            <DownloadCloud className="h-4 w-4" />
            Eski Föyleri Aktar
          </button>
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg shadow hover:bg-sky-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Yeni Satır
          </button>
        </div>
      </div>

      <CardContent className="p-0 overflow-auto flex-1 bg-neutral-50/50 md:bg-white print:bg-white print:overflow-visible">
        <div className="flex border-b-2 border-neutral-400">
          <div className="w-1/4 bg-yellow-400 border-r-2 border-neutral-400 px-4 py-2 flex items-center justify-center text-[10px] font-black tracking-widest uppercase text-center text-neutral-900">
            GZL TEKSTİL
          </div>
          <div className="flex-1 bg-yellow-300 px-4 py-2 flex items-center justify-center text-[13px] font-black tracking-[0.2em] uppercase text-center text-neutral-900">
            KALAN KUMAŞ STOK TABLOSU
          </div>
        </div>
        <div className="hidden lg:block print:block w-full">
          <table className="w-full text-left border-collapse select-none table-fixed">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-center border-b border-neutral-300">
                <th className="bg-neutral-100 text-neutral-400 px-1 py-3 w-[3%] print:hidden"></th>
                <th className="bg-orange-200/80 text-orange-900 px-2 py-3 border-r border-neutral-300 w-[13%]">FATURA NO</th>
                <th className="bg-orange-200/80 text-orange-900 px-2 py-3 border-r border-neutral-300 w-[13%]">MALZEME KODU</th>
                <th className="bg-orange-200/80 text-orange-900 border-r border-neutral-300 w-[10%]">
                  <button onClick={() => requestSort("faturaTarih")} className="w-full h-full px-2 py-3 flex items-center justify-center gap-1 hover:bg-orange-300/50 transition-colors">
                    FATURA TARİH
                    <ArrowUpDown className="h-3 w-3 opacity-70" />
                  </button>
                </th>
                <th className="bg-sky-400 text-sky-950 border-r border-neutral-300 w-[10%]">
                  <button onClick={() => requestSort("depoyaGirisTarihi")} className="w-full h-full px-2 py-3 flex items-center justify-center gap-1 hover:bg-sky-500/50 transition-colors">
                    DEPOYA GİRİŞ<br/>TARİHİ
                    <ArrowUpDown className="h-3 w-3 opacity-70" />
                  </button>
                </th>
                <th className="bg-sky-400 text-sky-950 px-2 py-3 border-r border-neutral-300 w-[15%]">KUMAŞ KODU</th>
                <th className="bg-sky-400 text-sky-950 px-2 py-3 border-r border-neutral-300 w-[12%]">KUMAŞ<br/>MT/KG</th>
                <th className="bg-orange-200/80 text-orange-900 px-2 py-3 border-r border-neutral-300 w-[12%]">BİRİM FİYAT</th>
                <th className="bg-orange-200/80 text-orange-900 px-2 py-3 border-r border-neutral-300 w-[12%]">TOPLAM TUTAR</th>
                <th className="bg-neutral-100 text-neutral-400 px-2 py-3 w-[3%] print:hidden"></th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-semibold text-neutral-800 divide-y divide-neutral-200">
              {sortedRecords.map((r, i) => (
                <React.Fragment key={r.id}>
                  <tr className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-1 border-r border-neutral-200 text-center print:hidden bg-neutral-50/30">
                      <button onClick={() => setExpandedNotes(p => ({ ...p, [r.id]: !p[r.id] }))} className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${r.notlar?.aciklama || r.notlar?.kesilenMt || r.notlar?.kalanMt ? 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200' : 'text-sky-500 hover:text-sky-600 hover:bg-sky-50'}`} title="Notlar">
                        <StickyNote className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="p-1 border-r border-neutral-200">
                    <input
                      value={r.faturaNo}
                      onChange={(e) => updateRecord(r.id, { faturaNo: e.target.value.toUpperCase() })}
                      className="w-full h-8 px-2 bg-transparent focus:outline-none focus:bg-white text-center font-bold text-neutral-700"
                    />
                  </td>
                  <td className="p-1 border-r border-neutral-200">
                    <input
                      value={r.malzemeKodu}
                      onChange={(e) => updateRecord(r.id, { malzemeKodu: e.target.value.toUpperCase() })}
                      className="w-full h-8 px-2 bg-transparent focus:outline-none focus:bg-white text-center font-bold text-neutral-700"
                    />
                  </td>
                  <td className="p-1 border-r border-neutral-200">
                    <input
                      type="date"
                      value={r.faturaTarih}
                      onChange={(e) => updateRecord(r.id, { faturaTarih: e.target.value })}
                      className="w-full h-8 px-1 bg-transparent focus:outline-none focus:bg-white text-center text-neutral-700 print:text-[9px]"
                    />
                  </td>
                  <td className="p-1 border-r border-neutral-200">
                    <input
                      type="date"
                      value={r.depoyaGirisTarihi}
                      onChange={(e) => updateRecord(r.id, { depoyaGirisTarihi: e.target.value })}
                      className="w-full h-8 px-1 bg-transparent focus:outline-none focus:bg-white text-center text-neutral-700 print:text-[9px]"
                    />
                  </td>
                  <td className="p-1 border-r border-neutral-200 bg-sky-50/30">
                    <input
                      value={r.kumasKodu}
                      onChange={(e) => updateRecord(r.id, { kumasKodu: e.target.value.toUpperCase() })}
                      className="w-full h-8 px-2 bg-transparent focus:outline-none focus:bg-white text-center font-black text-sky-900"
                    />
                  </td>
                  <td className="p-1 border-r border-neutral-200 bg-sky-50/30">
                    <input
                      value={r.kumasMetraji}
                      onChange={(e) => updateRecord(r.id, { kumasMetraji: e.target.value })}
                      onBlur={(e) => {
                        const val = e.target.value.trim()
                        if (!val) return;

                        let unit = "Mt";
                        if (val.toLowerCase().includes("kg")) unit = "Kg";
                        else if (val.toLowerCase().includes("mt")) unit = "Mt";
                        
                        const isKgRecord = (r.kumasMetraji || "").toLowerCase().includes("kg")
                        if (!val.toLowerCase().includes("mt") && !val.toLowerCase().includes("kg")) {
                          unit = isKgRecord ? "Kg" : "Mt";
                        }

                        const num = parseNumber(val);

                        if (num > 0 || num === 0) {
                          const formatted = num.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          updateRecord(r.id, { kumasMetraji: `${formatted} ${unit}` })
                        } else if (!val.toLowerCase().includes("mt") && !val.toLowerCase().includes("kg")) {
                          updateRecord(r.id, { kumasMetraji: `${val} ${unit}` })
                        }
                      }}
                      className="w-full h-8 px-2 bg-transparent focus:outline-none focus:bg-white text-center font-bold text-sky-800"
                    />
                  </td>
                  <td className="p-1 border-r border-neutral-200">
                    <input
                      type="number"
                      step="any"
                      value={r.birimFiyat ?? ""}
                      onChange={(e) => updateRecord(r.id, { birimFiyat: e.target.value ? parseFloat(e.target.value) : "" })}
                      style={{ fontSize: "clamp(9px, 1.1vw, 14px)" }}
                      className="w-full h-8 px-1 bg-transparent focus:outline-none focus:bg-white text-right font-bold text-neutral-700 tracking-tighter [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="p-1 border-r border-neutral-200">
                    <div className="relative">
                      <TotalInput record={r} getRowTotal={getRowTotal} updateRecord={updateRecord} />
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-neutral-400 font-bold select-none z-20 pointer-events-none" style={{ fontSize: "clamp(9px, 1.1vw, 14px)" }}>
                        ₺
                      </span>
                    </div>
                  </td>
                  <td className="p-1 text-center align-middle print:hidden">
                    <button onClick={() => deleteRecord(r.id)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
                  {expandedNotes[r.id] && (
                    <tr className="bg-sky-50/80 print:hidden border-b-2 border-sky-100">
                      <td colSpan={10} className="p-4 shadow-inner">
                        <div className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-sky-100">
                          <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Açıklama</label>
                            <textarea 
                              value={r.notlar?.aciklama || ""} 
                              onChange={e => updateRecord(r.id, { notlar: { ...(r.notlar || { kesilenMt: "", kalanMt: "" }), aciklama: e.target.value } })}
                              className="w-full min-h-[60px] p-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
                              placeholder="Kumaş ile ilgili notlarınızı buraya yazabilirsiniz..."
                            />
                          </div>
                          <div className="w-32 space-y-1.5">
                            <label className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Kesilen MT</label>
                            <input 
                              value={r.notlar?.kesilenMt || ""} 
                              onChange={e => updateRecord(r.id, { notlar: { ...(r.notlar || { aciklama: "", kalanMt: "" }), kesilenMt: e.target.value } })}
                              className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                              placeholder="örn. 50"
                            />
                          </div>
                          <div className="w-32 space-y-1.5">
                            <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Kalan MT</label>
                            <input 
                              value={r.notlar?.kalanMt || ""} 
                              onChange={e => updateRecord(r.id, { notlar: { ...(r.notlar || { aciklama: "", kesilenMt: "" }), kalanMt: e.target.value } })}
                              className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              placeholder="örn. 150"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {records.length < 10 && Array.from({ length: 10 - records.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-[38px]">
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td className="border-r border-neutral-200"></td>
                  <td></td>
                </tr>
              ))}
              {sortedRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-neutral-400">
                    Henüz kayıt bulunmuyor...
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="border-t-2 border-neutral-300 py-3 px-4 text-right font-black text-red-600 uppercase" style={{ fontSize: "clamp(10px, 1.2vw, 14px)" }}>
                  TOPLAM TUTAR (KDV HARİÇ)
                </td>
                <td className="border-t-2 border-l border-neutral-300 bg-neutral-50 py-3 pr-2 text-right font-black text-neutral-900" style={{ fontSize: "clamp(10px, 1.2vw, 14px)" }}>
                  {formatMoney(getGrandTotal())}
                </td>
                <td className="border-t-2 border-neutral-300"></td>
              </tr>
              <tr>
                <td colSpan={9} className="py-2 px-4 text-left font-medium text-neutral-500 text-[10px]">
                  Toplam tutara faturası olmayan kumaşlar dahil değildir.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* =======================================================
             MOBILE LAYOUT - Hides on Desktop (and Print)
           ======================================================= */}
        <div className="block lg:hidden p-4 space-y-4 print:hidden">
          {sortedRecords.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              {/* Header chunk: Kumaş Kodu & Sil Button */}
              <div className="bg-sky-50/50 p-3 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Kumaş Kodu</Label>
                  <input
                    value={r.kumasKodu}
                    onChange={(e) => updateRecord(r.id, { kumasKodu: e.target.value.toUpperCase() })}
                    className="w-full bg-transparent focus:outline-none font-black text-sky-900 text-lg mt-0.5"
                    placeholder="örn. ME777"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setExpandedNotes(p => ({ ...p, [r.id]: !p[r.id] }))} className={`p-2 rounded-lg transition-colors ${r.notlar?.aciklama || r.notlar?.kesilenMt || r.notlar?.kalanMt ? 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200' : 'text-sky-500 hover:text-sky-600 hover:bg-sky-100'}`}>
                    <StickyNote className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteRecord(r.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Depoya Giriş Tarihi</Label>
                    <input
                      type="date"
                      value={r.depoyaGirisTarihi}
                      onChange={(e) => updateRecord(r.id, { depoyaGirisTarihi: e.target.value })}
                      className="w-full h-9 px-2 rounded-md border border-neutral-200 focus:outline-none text-sm text-neutral-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Kumaş Mt/Kg</Label>
                    <input
                      value={r.kumasMetraji}
                      onChange={(e) => updateRecord(r.id, { kumasMetraji: e.target.value })}
                      onBlur={(e) => {
                        const val = e.target.value.trim()
                        if (!val) return;

                        let unit = "Mt";
                        if (val.toLowerCase().includes("kg")) unit = "Kg";
                        else if (val.toLowerCase().includes("mt")) unit = "Mt";
                        
                        const isKgRecord = (r.kumasMetraji || "").toLowerCase().includes("kg")
                        if (!val.toLowerCase().includes("mt") && !val.toLowerCase().includes("kg")) {
                          unit = isKgRecord ? "Kg" : "Mt";
                        }

                        const num = parseNumber(val);

                        if (num > 0 || num === 0) {
                          const formatted = num.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          updateRecord(r.id, { kumasMetraji: `${formatted} ${unit}` })
                        } else if (!val.toLowerCase().includes("mt") && !val.toLowerCase().includes("kg")) {
                          updateRecord(r.id, { kumasMetraji: `${val} ${unit}` })
                        }
                      }}
                      className="w-full h-9 px-2 rounded-md border border-neutral-200 focus:outline-none text-sm font-bold text-neutral-700"
                      placeholder="örn. 300 Mt"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Fatura No</Label>
                    <input
                      value={r.faturaNo}
                      onChange={(e) => updateRecord(r.id, { faturaNo: e.target.value.toUpperCase() })}
                      className="w-full h-9 px-2 rounded-md border border-orange-200 bg-orange-50/30 focus:outline-none focus:bg-orange-50/50 text-sm font-bold text-neutral-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Fatura Tarih</Label>
                    <input
                      type="date"
                      value={r.faturaTarih}
                      onChange={(e) => updateRecord(r.id, { faturaTarih: e.target.value })}
                      className="w-full h-9 px-2 rounded-md border border-orange-200 bg-orange-50/30 focus:outline-none focus:bg-orange-50/50 text-sm text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Malzeme Kodu</Label>
                    <input
                      value={r.malzemeKodu}
                      onChange={(e) => updateRecord(r.id, { malzemeKodu: e.target.value.toUpperCase() })}
                      className="w-full h-9 px-2 rounded-md border border-orange-200 bg-orange-50/30 focus:outline-none focus:bg-orange-50/50 text-sm font-bold text-neutral-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Birim Fiyat (₺)</Label>
                    <input
                      type="number"
                      step="any"
                      value={r.birimFiyat ?? ""}
                      onChange={(e) => updateRecord(r.id, { birimFiyat: e.target.value ? parseFloat(e.target.value) : "" })}
                      className="w-full h-9 px-2 rounded-md border border-orange-200 bg-orange-50/30 focus:outline-none focus:bg-orange-50/50 text-sm font-bold text-neutral-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Toplam Tutar</span>
                  <div className="relative w-32">
                    <TotalInput record={r} getRowTotal={getRowTotal} updateRecord={updateRecord} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">₺</span>
                  </div>
                </div>
              </div>
              
              {expandedNotes[r.id] && (
                <div className="p-3 bg-sky-50/80 border-t-2 border-sky-100 space-y-3 print:hidden">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Açıklama</label>
                    <textarea 
                      value={r.notlar?.aciklama || ""} 
                      onChange={e => updateRecord(r.id, { notlar: { ...(r.notlar || { kesilenMt: "", kalanMt: "" }), aciklama: e.target.value } })}
                      className="w-full min-h-[60px] p-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none bg-white"
                      placeholder="Kumaş notları..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Kesilen MT</label>
                      <input 
                        value={r.notlar?.kesilenMt || ""} 
                        onChange={e => updateRecord(r.id, { notlar: { ...(r.notlar || { aciklama: "", kalanMt: "" }), kesilenMt: e.target.value } })}
                        className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                        placeholder="örn. 50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Kalan MT</label>
                      <input 
                        value={r.notlar?.kalanMt || ""} 
                        onChange={e => updateRecord(r.id, { notlar: { ...(r.notlar || { aciklama: "", kesilenMt: "" }), kalanMt: e.target.value } })}
                        className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        placeholder="örn. 150"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Mobile Grand Total Card */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm mt-6">
            <h4 className="text-[11px] font-black text-red-600 uppercase tracking-wider mb-1">TOPLAM TUTAR (KDV HARİÇ)</h4>
            <div className="text-2xl font-black text-neutral-900 mb-2">
              {formatMoney(getGrandTotal())}
            </div>
            <p className="text-[10px] font-medium text-neutral-500">
              Toplam tutara faturası olmayan kumaşlar dahil değildir.
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
