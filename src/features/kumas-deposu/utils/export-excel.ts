import ExcelJS from "exceljs"
import { KumasDeposuRecord } from "../kumas-deposu-store"

export const exportToExcel = async (records: KumasDeposuRecord[]) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(`Kumas_Deposu`)

  // Tanımlı renkler (ARGB formatında)
  const bgSky = "FFBAE6FD"    // sky-200
  const bgOrange = "FFFEDB71" // orange-200 / FCD34D vs.
  const bgYellow = "FFFACC15" // yellow-400

  // 1. Satır: Büyük Sarı Başlık
  sheet.mergeCells("A1:B1")
  sheet.mergeCells("C1:L1")
  
  const cellA1 = sheet.getCell("A1")
  cellA1.value = "GZL TEKSTİL"
  cellA1.font = { bold: true, size: 10 }
  cellA1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFACC15" } } // yellow-400
  cellA1.alignment = { horizontal: "center", vertical: "middle" }

  const cellC1 = sheet.getCell("C1")
  cellC1.value = "KUMAŞ DEPOSU"
  cellC1.font = { bold: true, size: 12 }
  cellC1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE047" } } // yellow-300
  cellC1.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
  
  sheet.getRow(1).height = 30

  // Sütun başlıkları
  const headers = [
    "TARİH", "RENK", "FİRMA", "SEZON", "KUMAŞ KODU", "GELEN METRAJ",
    "KESİM TARİHİ", "BAĞLANAN MODEL", "KESİLEN ADET", "HARCANAN METRAJ", "AÇIKLAMA",
    "NET METRAJ"
  ]

  // Başlık satırını ekle (2. Satır)
  const headerRow = sheet.addRow(headers)
  headerRow.height = 35
  
  // Başlık satırı stilleri
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, size: 10 }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" }
    }

    let bgColor = bgSky
    if (colNumber >= 7 && colNumber <= 11) bgColor = "FFFDBA74" // orange-300
    else if (colNumber === 12) bgColor = bgYellow

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: bgColor }
    }
  })

  // Sütun genişliklerini ayarla
  sheet.columns.forEach((column, index) => {
    if (index === 0) column.width = 12 // TARİH
    else if (index === 1) column.width = 15 // RENK
    else if (index === 2) column.width = 18 // FİRMA
    else if (index === 3) column.width = 10 // SEZON
    else if (index === 4) column.width = 15 // KUMAŞ KODU
    else if (index === 5) column.width = 15 // GELEN METRAJ
    else if (index === 6) column.width = 15 // KESİM TARİHİ
    else if (index === 7) column.width = 18 // BAĞLANAN MODEL
    else if (index === 8) column.width = 12 // KESİLEN ADET
    else if (index === 9) column.width = 18 // HARCANAN METRAJ
    else if (index === 10) column.width = 25 // AÇIKLAMA
    else if (index === 11) column.width = 15 // NET METRAJ
  })

  // Verileri ekle
  records.forEach((r) => {
    const rowValues = [
      r.tarih || "",
      r.renk || "",
      r.firma || "",
      r.sezon || "",
      r.kumasKodu || "",
      r.gelenMetraj || "",
      r.kesimTarihi || "",
      r.baglananModel || "",
      r.kesilenAdet || "",
      r.harcananMetraj || "",
      r.aciklama || "",
      r.netMetraj || ""
    ]

    const isChild = !!r.parentId
    const dataRow = sheet.addRow(rowValues)
    
    // Veri satırı stilleri
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { size: 10 }
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" }
      }

      // Kırmızı ve kalın olanlar (Harcanan Metraj)
      if (colNumber === 10) {
        cell.font = { bold: true, size: 10, color: { argb: "FFDC2626" } } // red-600
      }
      // Gelen ve Net Metraj kalın
      if (colNumber === 6 || colNumber === 12) {
        cell.font = { bold: true, size: 10 }
      }

      // Arkaplan renklendirmesi (Normal vs. Devir satırı)
      let bgColor = "FFFFFFFF" // default white
      if (colNumber >= 1 && colNumber <= 6) {
        bgColor = isChild ? "FFECFDF5" : "FFF0F9FF" // emerald-50 vs sky-50
      } else if (colNumber >= 7 && colNumber <= 11) {
        bgColor = isChild ? "FFD1FAE5" : "FFFFF7ED" // emerald-100 vs orange-50
      } else if (colNumber === 12) {
        bgColor = isChild ? "FFA7F3D0" : "FFFEFCE8" // emerald-200 vs yellow-50
      }

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgColor }
      }
    })
  })

  // Dosyayı indir
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Kumas_Deposu_${new Date().toISOString().split('T')[0]}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}
