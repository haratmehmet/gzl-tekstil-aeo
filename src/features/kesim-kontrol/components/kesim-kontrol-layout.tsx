"use client"

import React, { useEffect, useState } from "react"
import { useKesimKontrol, KesimKontrolRecord } from "../kesim-kontrol-store"
import { KesimKontrolForm } from "./kesim-kontrol-form"
import { DownloadCloud, Save, Trash2, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScaleWrapper } from "@/components/ui/scale-wrapper"
import ExcelJS from "exceljs"

export function KesimKontrolLayout() {
  const { records, isLoading, fetchRecords, addRecord, updateRecord, deleteRecord } = useKesimKontrol()
  const defaultBedenler = {
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

  const [formData, setFormData] = useState<KesimKontrolRecord>({
    id: "",
    modelKodu: "",
    kesimTarihi: "",
    sezonMarka: "",
    sapKodu: "",
    notlar: "",
    kumaslar: Array(4).fill(null).map(() => ({ kodu: "", kullanimYeri: "", birimMetre: "", kumasciFirma: "" })),
    bedenler: defaultBedenler,
  })
  
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

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
    } catch (error: any) {
      alert("Hata: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewForm = () => {
    setFormData({
      id: "",
      modelKodu: "",
      kesimTarihi: "",
      sezonMarka: "",
      sapKodu: "",
      notlar: "",
      kumaslar: Array(4).fill(null).map(() => ({ kodu: "", kullanimYeri: "", birimMetre: "", kumasciFirma: "" })),
      bedenler: {
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
      },
    })
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleExportExcel = async () => {
    const ExcelJS = (await import("exceljs")).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet("Kesim Kontrol Föyü")

    // A4 Dikey yazdırma ayarları
    ws.pageSetup.paperSize = 9          // A4
    ws.pageSetup.orientation = "portrait"
    ws.pageSetup.fitToPage = true
    ws.pageSetup.fitToWidth = 1
    ws.pageSetup.fitToHeight = 0        // 0 = satır sayısı sınırsız, sadece genişlik 1 sayfaya sığsın
    ws.pageSetup.horizontalCentered = true
    ws.pageSetup.margins = { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25, header: 0, footer: 0 }

    // Sütunlar: Dinamik
    const hLen = formData.bedenler.headers.length || 1
    const totalCols = 1 + hLen + 2 // A + headers + (Toplam Adet, Kesilen MT)
    
    const cols = [{ width: 12 }] // A (Kumaş Türü / Kumaş X)
    for(let i=0; i < hLen; i++) cols.push({ width: 9 }) // Bedenler
    cols.push({ width: 14 }) // Toplam Adet
    cols.push({ width: 14 }) // Kesilen Toplam
    ws.columns = cols

    const Y = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFFDE047" } } // Sarı
    const O = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFfed7aa" } } // Turuncu
    const B = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFbae6fd" } } // Mavi
    const G = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF3F4F6" } } // Gri
    const W = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFFFFFFF" } } // Beyaz
    const bold = { bold: true, size: 10 }
    const C = { horizontal: "center" as const, vertical: "middle" as const, wrapText: true }
    const border = { top:{style:"thin" as const}, bottom:{style:"thin" as const}, left:{style:"thin" as const}, right:{style:"thin" as const} }

    const applyStyle = (cell: ExcelJS.Cell, fill: any, font = bold, alignment = C) => {
      cell.fill = fill; cell.font = font; cell.alignment = alignment; cell.border = border
    }

    // ============ SATIR 1: BAŞLIK ============
    ws.mergeCells(1, 1, 1, 3); ws.mergeCells(1, 4, 1, totalCols)
    applyStyle(ws.getCell(1, 1), Y); ws.getCell(1, 1).value = "GZL TEKSTİL"
    applyStyle(ws.getCell(1, 4), Y); ws.getCell(1, 4).value = "KESİM KONTROL FÖYÜ"
    ws.getCell(1, 4).font = { bold: true, size: 13 }
    ws.getRow(1).height = 28

    // ============ SATIR 2: MODEL + TARİH ============
    ws.mergeCells(2, 1, 2, 3)
    applyStyle(ws.getCell(2, 1), W); ws.getCell(2, 1).value = ""
    applyStyle(ws.getCell(2, 4), G); ws.getCell(2, 4).value = "MODEL KODU"
    ws.mergeCells(2, 5, 2, 6)
    applyStyle(ws.getCell(2, 5), W); ws.getCell(2, 5).value = formData.modelKodu
    applyStyle(ws.getCell(2, 7), G); ws.getCell(2, 7).value = "KESİM TARİHİ"
    ws.mergeCells(2, 8, 2, totalCols)
    applyStyle(ws.getCell(2, 8), W); ws.getCell(2, 8).value = formData.kesimTarihi
    ws.getRow(2).height = 20

    // ============ SATIR 3: SEZON + SAP ============
    ws.mergeCells(3, 1, 3, 3)
    applyStyle(ws.getCell(3, 1), W); ws.getCell(3, 1).value = ""
    applyStyle(ws.getCell(3, 4), G); ws.getCell(3, 4).value = "SEZON/MARKA"
    ws.mergeCells(3, 5, 3, 6)
    applyStyle(ws.getCell(3, 5), W); ws.getCell(3, 5).value = formData.sezonMarka
    applyStyle(ws.getCell(3, 7), G); ws.getCell(3, 7).value = "SAP KODU"
    ws.mergeCells(3, 8, 3, totalCols)
    applyStyle(ws.getCell(3, 8), W); ws.getCell(3, 8).value = formData.sapKodu
    ws.getRow(3).height = 20

    // ============ SATIR 4: KUMAŞ BAŞLIGI ============
    applyStyle(ws.getCell(4, 1), B); ws.getCell(4, 1).value = ""
    ws.mergeCells(4, 2, 4, 3)
    applyStyle(ws.getCell(4, 2), B); ws.getCell(4, 2).value = "KODU"
    ws.mergeCells(4, 4, 4, 5)
    applyStyle(ws.getCell(4, 4), B); ws.getCell(4, 4).value = "KULLANIM YERİ"
    applyStyle(ws.getCell(4, 6), B); ws.getCell(4, 6).value = "BİRİM METRE"
    ws.mergeCells(4, 7, 4, totalCols)
    applyStyle(ws.getCell(4, 7), B); ws.getCell(4, 7).value = "KUMAŞÇI FİRMA"
    ws.getRow(4).height = 22

    // ============ SATIRLAR 5-8: KUMAŞlar ============
    formData.kumaslar.forEach((k, i) => {
      const r = 5 + i
      applyStyle(ws.getCell(r, 1), G); ws.getCell(r, 1).value = `KUMAŞ ${i + 1}`
      ws.mergeCells(r, 2, r, 3)
      applyStyle(ws.getCell(r, 2), W); ws.getCell(r, 2).value = k.kodu
      ws.mergeCells(r, 4, r, 5)
      applyStyle(ws.getCell(r, 4), W); ws.getCell(r, 4).value = k.kullanimYeri
      applyStyle(ws.getCell(r, 6), W); ws.getCell(r, 6).value = k.birimMetre
      ws.mergeCells(r, 7, r, totalCols)
      applyStyle(ws.getCell(r, 7), W); ws.getCell(r, 7).value = k.kumasciFirma
      ws.getRow(r).height = 18
    })

    // ============ SATIR 9: BEDEN BAŞLIGI ============
    const br = 9
    applyStyle(ws.getCell(br, 1), O); ws.getCell(br, 1).value = "KUMAŞ TÜRÜ"
    formData.bedenler.headers.forEach((h, i) => {
      const col = 2 + i
      applyStyle(ws.getCell(br, col), O); ws.getCell(br, col).value = h
    })
    
    const tCol = 2 + hLen
    applyStyle(ws.getCell(br, tCol), O); ws.getCell(br, tCol).value = "TOPLAM ADET"
    applyStyle(ws.getCell(br, tCol + 1), O); ws.getCell(br, tCol + 1).value = "KESİLEN TOPLAM MT"
    ws.getRow(br).height = 28

    // ============ SATIRLAR 10+: Bedenler ============
    formData.bedenler.rows.forEach((b, i) => {
      const r = br + 1 + i
      applyStyle(ws.getCell(r, 1), G); ws.getCell(r, 1).value = b.kumasTuru
      
      formData.bedenler.headers.forEach((h, hi) => {
        const col = 2 + hi
        applyStyle(ws.getCell(r, col), W); ws.getCell(r, col).value = b.values[h] || ""
      })

      applyStyle(ws.getCell(r, tCol), W); ws.getCell(r, tCol).value = b.toplamAdet
      applyStyle(ws.getCell(r, tCol + 1), W); ws.getCell(r, tCol + 1).value = b.kesilenMt
      ws.getRow(r).height = 45 // Kumaş yapıştırma payı
    })

    // ============ NOTLAR ============
    const nr = br + 1 + formData.bedenler.rows.length
    applyStyle(ws.getCell(nr, 1), G); ws.getCell(nr, 1).value = "NOTLAR:"
    ws.mergeCells(nr, 2, nr, totalCols)
    const notCell = ws.getCell(nr, 2)
    notCell.value = formData.notlar
    notCell.border = border
    notCell.alignment = { vertical: "top" as const, wrapText: true }
    ws.getRow(nr).height = 60

    // ============ İNDIR ============
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kesim-kontrol-${formData.modelKodu || "foyu"}-${Date.now()}.xlsx`
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

      {/* MAIN FORM */}
      <div className="border rounded-xl shadow-sm bg-white">
        <KesimKontrolForm data={formData} onChange={setFormData} />
      </div>

      {/* SAVED RECORDS TABLE */}
      <div className="print:hidden mt-8 border rounded-xl shadow-sm bg-white overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <h3 className="font-bold text-neutral-800">Kaydedilen Föyler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-600">
            <thead className="text-xs text-neutral-500 bg-neutral-50 border-b">
              <tr>
                <th className="px-4 py-3">Model Kodu</th>
                <th className="px-4 py-3">Sezon / Marka</th>
                <th className="px-4 py-3">SAP Kodu</th>
                <th className="px-4 py-3">Kesim Tarihi</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center">Yükleniyor...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">Henüz kaydedilmiş bir föy bulunmuyor.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr 
                    key={r.id} 
                    onClick={() => setFormData(r)}
                    className="border-b hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900">{r.modelKodu || "-"}</td>
                    <td className="px-4 py-3">{r.sezonMarka || "-"}</td>
                    <td className="px-4 py-3">{r.sapKodu || "-"}</td>
                    <td className="px-4 py-3">{r.kesimTarihi || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation() // Tablo satırı onClick tetiklenmesin diye
                          if(confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
                            deleteRecord(r.id)
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                      >
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
