import ExcelJS from "exceljs"
import { CekmeFoyu } from "../types"

export const exportToExcel = async (foyler: CekmeFoyu[], sezon: string) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(`Cekme_Tablosu_${sezon}`)

  // Tanımlı renkler (ARGB formatında)
  const bgGray = "FFD9D9D9"
  const bgBlue = "FF9BC2E6"
  const bgPink = "FFE2A0D9"
  const bgPeach = "FFF4B084"
  const bgGreen = "FFA9D08E"

  // Sütun başlıkları
  const headers = [
    "TESTE GÖNDERİLME TARİHİ", "MODELİST", "ETİKET", "MODEL KODU", "SAP KODU", "KUMAŞ KODU",
    // 1. Kumaş
    "KULLANILDIĞI YER", "KUMAŞ İÇERİK", "TEDARİKÇİ", "ARTİKEL ADI", "ÜRÜN DPT RENK", "GELEN METRAJ", "KUMAŞ EN", "EN ÇEKME %DİR", "BOY ÇEKME %DİR",
    // 2. Kumaş
    "KULLANILDIĞI YER", "KUMAŞ İÇERİK", "TEDARİKÇİ", "ARTİKEL ADI", "ÜRÜN DPT RENK", "GELEN METRAJ", "KUMAŞ EN", "EN ÇEKME %DİR", "BOY ÇEKME %DİR",
    // 3. Kumaş
    "KULLANILDIĞI YER", "KUMAŞ İÇERİK", "TEDARİKÇİ", "ARTİKEL ADI", "ÜRÜN DPT RENK", "GELEN METRAJ", "KUMAŞ EN", "EN ÇEKME %DİR", "BOY ÇEKME %DİR",
  ]

  // Başlık satırını ekle
  const headerRow = sheet.addRow(headers)
  headerRow.height = 30
  
  // Başlık satırı stilleri
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, size: 10 }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" }
    }

    let bgColor = bgGray
    if (colNumber === 6) bgColor = bgBlue // KUMAŞ KODU
    else if (colNumber >= 7 && colNumber <= 15) bgColor = bgPink // 1. Kumaş
    else if (colNumber >= 16 && colNumber <= 24) bgColor = bgPeach // 2. Kumaş
    else if (colNumber >= 25 && colNumber <= 33) bgColor = bgGreen // 3. Kumaş

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: bgColor }
    }
  })

  // Sütun genişliklerini ayarla
  sheet.columns.forEach((column, index) => {
    if (index === 0) column.width = 15 // Tarih
    else if (index >= 1 && index <= 5) column.width = 12
    else column.width = 15 // Kumaş detayları
  })

  // Verileri ekle
  foyler.forEach((foy) => {
    const rowValues: any[] = [
      foy.testeGonderilmeTarihi ? new Date(foy.testeGonderilmeTarihi).toLocaleDateString("tr-TR") : "-",
      foy.modelist || "-",
      foy.etiket || "-",
      foy.modelKodu || "-",
      foy.sapKodu || "-",
      foy.kumasKodu || "-"
    ]

    // Maksimum 3 kumaş
    for (let i = 0; i < 3; i++) {
      const fab = foy.fabrics?.[i]
      if (fab) {
        rowValues.push(
          fab.kullanildigiYer || "-",
          fab.kumasIcerik || "-",
          fab.tedarikci || "-",
          fab.artikelAdi || "-",
          fab.urunDptRenk || "-",
          fab.gelenMetraj || "-",
          fab.kumasEn || "-",
          fab.enCekmeYuzde || "-",
          fab.boyCekmeYuzde || "-"
        )
      } else {
        // Kumaş yoksa tire ile doldur
        rowValues.push("-", "-", "-", "-", "-", "-", "-", "-", "-")
      }
    }

    const dataRow = sheet.addRow(rowValues)
    
    // Veri satırı stilleri
    dataRow.eachCell((cell) => {
      cell.font = { size: 10 }
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" }
      }
    })
  })

  // Dosyayı oluştur ve indir
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement("a")
  a.href = url
  a.download = `GZL_Cekme_Tablosu_${sezon}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
