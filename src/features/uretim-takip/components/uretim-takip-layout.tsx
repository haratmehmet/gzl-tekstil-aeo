"use client"

import React, { useState, useEffect } from "react"
import { useUretimTakip, DEFAULT_FORM, UretimTakipRecord } from "../uretim-takip-store"
import { UretimTakipForm } from "./uretim-takip-form"
import { Save, Trash2, DownloadCloud, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScaleWrapper } from "@/components/ui/scale-wrapper"

export function UretimTakipLayout() {
  const { records, isLoading, fetchRecords, addRecord, updateRecord, deleteRecord } = useUretimTakip()
  const [formData, setFormData] = useState<UretimTakipRecord>({ ...DEFAULT_FORM, bedenler: DEFAULT_FORM.bedenler.map(b => ({ ...b })) })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleNewForm = () => setFormData({ ...DEFAULT_FORM, bedenler: DEFAULT_FORM.bedenler.map(b => ({ ...b })) })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { id, ...dataToSave } = formData
      if (id) {
        await updateRecord(id, dataToSave)
        alert("Başarıyla güncellendi!")
      } else {
        await addRecord(dataToSave)
        alert("Başarıyla kaydedildi!")
        handleNewForm()
      }
    } catch (err: any) {
      alert("Hata: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = () => window.print()

  const handleExportExcel = async () => {
    const ExcelJS = (await import("exceljs")).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet("Ürün Takip Föyü")

    ws.pageSetup.paperSize = 9
    ws.pageSetup.orientation = "portrait"
    ws.pageSetup.fitToPage = true
    ws.pageSetup.fitToWidth = 1
    ws.pageSetup.fitToHeight = 0
    ws.pageSetup.horizontalCentered = true
    ws.pageSetup.margins = { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25, header: 0, footer: 0 }

    ws.columns = [{ width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }]

    const Y = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFFDE047" } }
    const B = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFbae6fd" } }
    const G = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF3F4F6" } }
    const P = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFffe4e6" } }
    const Gr = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFbbf7d0" } }
    const W = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFFFFFFF" } }
    const bold = { bold: true, size: 10 }
    const C = { horizontal: "center" as const, vertical: "middle" as const, wrapText: true }
    const br = { top: { style: "thin" as const }, bottom: { style: "thin" as const }, left: { style: "thin" as const }, right: { style: "thin" as const } }
    const s = (cell: any, fill: any, val: any, font: any = bold) => { cell.fill = fill; cell.font = font; cell.alignment = C; cell.border = br; cell.value = val }

    // Başlık
    ws.mergeCells("A1:B1"); ws.mergeCells("C1:D1")
    s(ws.getCell("A1"), Y, "GZL TEKSTİL"); s(ws.getCell("C1"), Y, "ÜRÜN TAKİP FÖYÜ")
    ws.getCell("C1").font = { bold: true, size: 13 }; ws.getRow(1).height = 28

    // Üst bilgiler
    const info = [
      ["MODEL KODU", formData.modelKodu, "SEZON", formData.sezon],
      ["SAP KODU", formData.sapKodu, "ETİKET", formData.etiket],
      ["KUMAŞ KODU", formData.kumasKodu, "KUMAŞ İÇERİK", formData.kumasIcerik],
      ["KESİM TARİHİ", formData.kesimTarihi, "DİKİM BAŞLANGIÇ", formData.dikimBaslangicTarihi],
      ["PAKETLEME TARİHİ", formData.paketlemeTarihi, "", ""],
    ]
    info.forEach((row, i) => {
      const r = ws.getRow(2 + i)
      s(r.getCell(1), G, row[0]); s(r.getCell(2), W, row[1], { size: 10 })
      s(r.getCell(3), G, row[2]); s(r.getCell(4), W, row[3], { size: 10 })
      r.height = 20
    })

    // Beden başlık
    const bh = ws.getRow(7)
    s(bh.getCell(1), B, "BEDEN"); s(bh.getCell(2), B, "KESİLEN ADET")
    s(bh.getCell(3), Gr, "2.KALİTE ADET"); s(bh.getCell(4), B, "NET ADET")
    bh.height = 22

    // Beden satırları
    formData.bedenler.forEach((b, i) => {
      const r = ws.getRow(8 + i)
      s(r.getCell(1), B, `${b.beden} / ${b.bedenAdi}`)
      s(r.getCell(2), W, b.kesilenAdet, { size: 10 })
      s(r.getCell(3), W, b.ikiKaliteAdet, { size: 10 })
      s(r.getCell(4), W, b.netAdet, { size: 10 })
      r.height = 18
    })

    // Toplamlar
    const totals = [
      ["TOPLAM KESİLEN ADET:", formData.bedenler.reduce((s, b) => s + (parseFloat(b.kesilenAdet) || 0), 0)],
      ["TOPLAM 2.KALİTE ADET:", formData.bedenler.reduce((s, b) => s + (parseFloat(b.ikiKaliteAdet) || 0), 0)],
      ["TOPLAM NET ADET:", formData.bedenler.reduce((s, b) => s + (parseFloat(b.netAdet) || 0), 0)],
    ]
    const totalsStartRow = 8 + formData.bedenler.length;
    totals.forEach(([label, val], i) => {
      const rn = totalsStartRow + i
      const r = ws.getRow(rn)
      ws.mergeCells(`A${rn}:B${rn}`)
      ws.mergeCells(`C${rn}:D${rn}`)
      s(r.getCell(1), B, label); s(r.getCell(3), W, val || "", { bold: true, size: 10 })
      r.height = 20
    })

    // Alt bölüm - pembe
    const altStartRow = totalsStartRow + totals.length;
    const altRows = [
      ["KESİLEN METRAJ", formData.kesilenMetraj],
      ["ETİKET", formData.etiketBilgi],
      ["NUMARA", formData.numara],
      ["BARKOD/TALİMAT", formData.barkodTalimat],
      ["FİYAT STICKER", formData.fiyatSticker],
      ["K/K DURUMU", formData.kkDurumu],
      ["SEVK DURUMU", formData.sevkDurumu],
    ]
    altRows.forEach(([label, val], i) => {
      const rn = altStartRow + i
      const r = ws.getRow(rn)
      ws.mergeCells(`A${rn}:B${rn}`); ws.mergeCells(`C${rn}:D${rn}`)
      s(r.getCell(1), P, label); s(r.getCell(3), W, val, { size: 10 })
      r.height = 20
    })

    // Not/Kritik
    const nr = altStartRow + altRows.length;
    ws.mergeCells(`A${nr}:D${nr + 2}`)
    const notCell = ws.getCell(`A${nr}`)
    notCell.value = `NOT/KRİTİK:\n${formData.notKritik}`
    notCell.fill = B; notCell.border = br
    notCell.font = { size: 10 }
    notCell.alignment = { vertical: "top" as const, wrapText: true }
    ws.getRow(nr).height = 60

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `uretim-takip-${formData.modelKodu || "foyu"}-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col space-y-6">

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="text-lg font-bold text-neutral-800">
          {formData.id ? "Föyü Düzenle" : "Yeni Föy Oluştur"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {formData.id && (
            <Button onClick={handleNewForm} variant="outline" className="gap-2 border-dashed text-xs">
              Temizle / Yeni
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs">
            <Save className="h-4 w-4" /> {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2 text-xs">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
          </Button>
          <Button onClick={handleExportPDF} variant="outline" className="gap-2 text-xs">
            <DownloadCloud className="h-4 w-4 text-blue-600" /> PDF
          </Button>
        </div>
      </div>

      {/* FORM */}
      <div className="border rounded-xl shadow-sm bg-white">
        <UretimTakipForm data={formData} onChange={setFormData} />
      </div>

      {/* KAYDEDİLENLER */}
      <div className="print:hidden mt-8 border rounded-xl shadow-sm bg-white overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <h3 className="font-bold text-neutral-800">Kaydedilen Föyler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-600">
            <thead className="text-xs text-neutral-500 bg-neutral-50 border-b">
              <tr>
                <th className="px-4 py-3">Model Kodu</th>
                <th className="px-4 py-3">Sezon</th>
                <th className="px-4 py-3">SAP Kodu</th>
                <th className="px-4 py-3">Kesim Tarihi</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-4 text-center">Yükleniyor...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">Henüz kaydedilmiş bir föy bulunmuyor.</td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} onClick={() => setFormData(r)} className="border-b hover:bg-neutral-50 cursor-pointer transition-colors group">
                    <td className="px-4 py-3 font-medium text-neutral-900">{r.modelKodu || "-"}</td>
                    <td className="px-4 py-3">{r.sezon || "-"}</td>
                    <td className="px-4 py-3">{r.sapKodu || "-"}</td>
                    <td className="px-4 py-3">{r.kesimTarihi || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm"
                        onClick={e => { e.stopPropagation(); if (confirm("Silmek istediğinize emin misiniz?")) deleteRecord(r.id) }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
