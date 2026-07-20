"use client"

import React from "react"
import { Plus, Trash2, FileSpreadsheet, Palette } from "lucide-react"
import * as ExcelJS from "exceljs"
import { getGenelUretimKayitlar, addGenelUretimKayit, updateGenelUretimKayit, deleteGenelUretimKayit, updateGenelUretimKayitBulkColor } from "../actions"

interface GenelUretimTableProps {
  sezonId: string
  markaTipi: "academia" | "beymen"
  sezonAd: string
}

export function GenelUretimTable({ sezonId, markaTipi, sezonAd }: GenelUretimTableProps) {
  const [records, setRecords] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [cellMenuOpen, setCellMenuOpen] = React.useState<{ recordId: string, colName: string } | null>(null)

  const colorableColumns = [
    "siparisId",
    "sapKodu",
    "modelKodu",
    "modelist",
    "butceAdet",
    "kumasGelisTarihi",
    "cekmeTesti",
    "fitKalibiGelis",
    "fitDikildi",
    "uretimPastali",
    "kesimiTamamlandi",
    "kaliteKontrol",
    "teslimTarihi"
  ]

  React.useEffect(() => {
    loadRecords()
  }, [sezonId, markaTipi])

  const loadRecords = async () => {
    setLoading(true)
    const res = await getGenelUretimKayitlar(sezonId, markaTipi)
    if (res.success && res.data) {
      setRecords(res.data)
    }
    setLoading(false)
  }

  const handleCellColor = async (recordId: string, startColIndex: number, color: string) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return
    
    let hucreRenkleri: any = {}
    if (record.hucreRenkleri) {
      try { hucreRenkleri = JSON.parse(record.hucreRenkleri) } catch(e){}
    }
    
    for (let i = startColIndex; i < colorableColumns.length; i++) {
      const cName = colorableColumns[i]
      if (color === 'none') {
        delete hucreRenkleri[cName]
      } else {
        hucreRenkleri[cName] = color
      }
    }
    
    const hucreRenkleriStr = Object.keys(hucreRenkleri).length > 0 ? JSON.stringify(hucreRenkleri) : null
    
    // Sadece o satırı güncelle
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, hucreRenkleri: hucreRenkleriStr } : r))
    setCellMenuOpen(null)
    
    const res = await updateGenelUretimKayit(recordId, { hucreRenkleri: hucreRenkleriStr })
    if (!res.success) {
      alert("Hata: " + res.error)
    }
  }

  const renderColoredCell = (r: any, colName: string, colIndex: number) => {
    let hucreRenkleri: any = {}
    if (r.hucreRenkleri) {
      try { hucreRenkleri = JSON.parse(r.hucreRenkleri) } catch(e){}
    }
    
    const color = hucreRenkleri[colName]
    const bgColorClass = color === "green" ? "bg-[#84cc16]" : color === "red" ? "bg-[#ef4444]" : ""
    const finalTextColorClass = color ? "text-white placeholder:text-white/70 focus:bg-white/20" : "text-neutral-800 focus:bg-white"
    
    return (
      <td key={colName} className={`p-0 border border-neutral-300 transition-colors relative group/cell ${bgColorClass}`}>
        <input 
          value={(r as any)[colName] || ""} 
          onChange={e => updateRecord(r.id, { [colName]: e.target.value })} 
          className={`w-full h-7 px-1 bg-transparent focus:outline-none text-center uppercase ${finalTextColorClass}`} 
        />
        <button 
          onClick={() => setCellMenuOpen({ recordId: r.id, colName })}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-hover/cell:opacity-100 hover:opacity-100 flex items-center justify-center text-neutral-500 hover:text-indigo-600 transition-all print:hidden bg-white/80 rounded"
          title="Buradan Sonrasını Boya"
        >
          <Palette className="w-2.5 h-2.5" />
        </button>

        {cellMenuOpen?.recordId === r.id && cellMenuOpen?.colName === colName && (
          <div className="absolute right-0 top-7 z-50 bg-white border border-neutral-200 shadow-xl rounded-lg p-1 flex gap-1 animate-in fade-in zoom-in-95 print:hidden">
            <button onClick={() => handleCellColor(r.id, colIndex, 'none')} className="w-6 h-6 rounded-md bg-neutral-100 hover:ring-2 ring-neutral-400" title="Renk Yok" />
            <button onClick={() => handleCellColor(r.id, colIndex, 'green')} className="w-6 h-6 rounded-md bg-[#84cc16] hover:ring-2 ring-[#84cc16]" title="Yeşil" />
            <button onClick={() => handleCellColor(r.id, colIndex, 'red')} className="w-6 h-6 rounded-md bg-[#ef4444] hover:ring-2 ring-[#ef4444]" title="Kırmızı" />
          </div>
        )}
      </td>
    )
  }

  const handleAddRow = async () => {
    try {
      const res = await addGenelUretimKayit(sezonId, markaTipi)
      if (res.success && res.data) {
        setRecords([...records, res.data])
      } else {
        alert("Satır eklenirken hata oluştu: " + res.error)
      }
    } catch (err: any) {
      alert("Bağlantı hatası: " + err.message)
    }
  }

  const updateRecord = async (id: string, updates: any) => {
    // Optimistic update
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    await updateGenelUretimKayit(id, updates)
  }

  const deleteRecord = async (id: string) => {
    if (!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return
    setRecords(prev => prev.filter(r => r.id !== id))
    await deleteGenelUretimKayit(id)
  }

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Genel Üretim Takip")

    const headers = [
      "Sipariş ID", "SAP Kodu", "Model Kodu", "MODELİST", "BÜTÇE ADET", 
      "KUMAŞ GELİŞ TARİHİ", "ÇEKME TESTİ", "FİT KALIBI GELİŞ", 
      "FİT DİKİLDİ (TESLİM TARİHİ)", "ÜRETİM PASTALI", "KESİMİ TAMAMLANDI", 
      "KALİTE KONTROL", "TESLİM TARİHİ (DEPO RANDEVU)"
    ]
    
    worksheet.columns = headers.map(h => ({
      width: h.length < 12 ? 15 : 22,
      style: { alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } }
    }))
    
    worksheet.addRow(headers)
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: "FF082F49" } } // text-sky-950
    headerRow.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF38BDF8" } } // bg-sky-400
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    records.forEach(r => {
      const row = worksheet.addRow([
        r.siparisId, r.sapKodu, r.modelKodu, r.modelist, r.butceAdet,
        r.kumasGelisTarihi, r.cekmeTesti, r.fitKalibiGelis, r.fitDikildi,
        r.uretimPastali, r.kesimiTamamlandi, r.kaliteKontrol, r.teslimTarihi
      ])

      let hucreRenkleri: any = {}
      if (r.hucreRenkleri) {
        try { hucreRenkleri = JSON.parse(r.hucreRenkleri) } catch(e){}
      }

      row.eachCell((cell, colNumber) => {
        const colName = colorableColumns[colNumber - 1]
        
        let color = r.satirRengi // Varsayılan olarak satırın genel rengini al
        if (colName && hucreRenkleri[colName]) {
          color = hucreRenkleri[colName] // Eğer hücreye özel renk seçilmişse, onu ez
        }

        const argb = color === "green" ? "FF84cc16" : color === "red" ? "FFef4444" : undefined
        if (argb) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } }
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true }
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Genel_Uretim_${sezonAd}_${markaTipi}_${new Date().toLocaleDateString("tr-TR")}.xlsx`
    link.click()
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 font-bold">Yükleniyor...</div>
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* TOOLBAR */}
      <div className="p-3 bg-neutral-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-neutral-200 print:hidden">
        <div className="text-xs font-black text-sky-950 uppercase tracking-widest text-center md:text-left w-full md:w-auto">
          {sezonAd} - {markaTipi === "academia" ? "ACADEMIA / BEYMEN COLLECTION" : "BEYMEN CLUB"}
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={handleAddRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Yeni Satır
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto bg-white print:overflow-visible">
        <table className="w-max min-w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 bg-sky-400 text-sky-950 shadow-sm z-10 print:static">
            <tr className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-center border-b-2 border-neutral-400 leading-tight">
              <th className="p-1 border border-sky-400 w-44">Sipariş ID</th>
              <th className="p-1 border border-sky-400 w-32">SAP Kodu</th>
              <th className="p-1 border border-sky-400 w-32">Model Kodu</th>
              <th className="p-1 border border-sky-400 w-32">MODELİST</th>
              <th className="p-1 border border-sky-400 w-24">BÜTÇE</th>
              <th className="p-1 border border-sky-400 w-32">KUMAŞ GELİŞ<br/>TARİHİ</th>
              <th className="p-1 border border-sky-400 w-32">ÇEKME TESTİ<br/>TARİHİ</th>
              <th className="p-1 border border-sky-400 w-32">FİT KALIBI<br/>TARİHİ</th>
              <th className="p-1 border border-sky-400 w-32">FİT DİKİLDİ<br/>TARİHİ</th>
              <th className="p-1 border border-sky-400 w-32">ÜRETİM PASTALI</th>
              <th className="p-1 border border-sky-400 w-32">KESİMİ<br/>TAMAMLANDI</th>
              <th className="p-1 border border-sky-400 w-32">KALİTE KONTROL</th>
              <th className="p-1 border border-sky-400 w-36">TESLİM TARİHİ<br/>(DEPO RND)</th>
              <th className="p-1 border border-sky-400 w-20 print:hidden bg-neutral-100"></th>
            </tr>
          </thead>
          <tbody className="text-[9px] font-bold text-neutral-800">
            {records.map((r, index) => {
              const rowColorClass = 
                r.satirRengi === "green" ? "bg-[#84cc16]" : 
                r.satirRengi === "red" ? "bg-[#ef4444] text-white" : 
                "hover:bg-neutral-50/50 bg-white"
              const inputColorClass = r.satirRengi === "red" ? "text-white placeholder:text-white/70 focus:bg-white/20" : "text-neutral-800 focus:bg-white"
              
              return (
                <tr key={r.id} className={`${rowColorClass} transition-colors group`}>
                  {colorableColumns.map((col, i) => renderColoredCell(r, col, i))}
                  
                  <td className="p-1 border border-neutral-300 text-center print:hidden relative bg-neutral-50/50 group-hover:bg-neutral-100 transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => deleteRecord(r.id)} className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors" title="Satırı Sil">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {records.length === 0 && (
              <tr>
                <td colSpan={14} className="p-8 text-center text-neutral-400 font-bold">Kayıt bulunamadı. Yeni satır ekleyerek başlayın.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
