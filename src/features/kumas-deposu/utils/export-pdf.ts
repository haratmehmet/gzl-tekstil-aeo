import { KumasDeposuRecord } from "../kumas-deposu-store"
import jsPDF from "jspdf"
import "jspdf-autotable"

export const exportToPDF = async (records: KumasDeposuRecord[]) => {
  // Use A4 landscape
  const doc = new jsPDF("l", "pt", "a4")

  // Load a font that supports Turkish characters if possible, but default is fine if we just want basic text for now
  // To avoid complex font loading, we will just use the default helvetica which handles most basic Turkish but might struggle with I/İ/Ş/ş
  // Since we don't have font files handy in this util, we rely on jsPDF's built-in fonts and autotable.

  // Title
  doc.setFontSize(16)
  doc.setTextColor(40)
  doc.text("GZL TEKSTIL - KUMAS DEPOSU", 40, 40)

  doc.setFontSize(10)
  doc.text(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`, 40, 60)

  // Define headers and data
  const head = [
    [
      "TARIH", "RENK", "FIRMA", "SEZON", "KUMAS KODU", "GELEN MT",
      "KESIM", "MODEL", "ADET", "HARCANAN", "ACIKLAMA", "NET KALAN"
    ]
  ]

  const data = records.map(r => [
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
  ])

  // Call autotable
  // @ts-ignore (autotable types might not be perfectly inferred)
  doc.autoTable({
    head: head,
    body: data,
    startY: 80,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { 
      fillColor: [255, 192, 0], // #FFC000 (Yellow)
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 60 },
      3: { cellWidth: 40 },
      4: { cellWidth: 50 },
      5: { cellWidth: 50, fontStyle: 'bold' },
      6: { cellWidth: 40 },
      7: { cellWidth: 60 },
      8: { cellWidth: 30 },
      9: { cellWidth: 50, textColor: [220, 38, 38], fontStyle: 'bold' }, // red-600
      10: { cellWidth: 'auto' }, // Açıklama takes remaining space
      11: { cellWidth: 50, fontStyle: 'bold' }
    },
    didParseCell: function(data: any) {
      // Color specific columns background exactly like the UI
      if (data.section === 'head') return;
      const colIndex = data.column.index;
      
      // Mavi kısımlar (0-5)
      if (colIndex >= 0 && colIndex <= 5) {
        data.cell.styles.fillColor = [224, 242, 254]; // sky-100
      }
      // Turuncu kısımlar (6-10)
      else if (colIndex >= 6 && colIndex <= 10) {
        data.cell.styles.fillColor = [255, 237, 213]; // orange-100
      }
      // Sarı Kısım (11)
      else if (colIndex === 11) {
        data.cell.styles.fillColor = [254, 240, 138]; // yellow-200
      }
    }
  })

  // Save the PDF
  doc.save(`Kumas_Deposu_${new Date().toISOString().split('T')[0]}.pdf`)
}
