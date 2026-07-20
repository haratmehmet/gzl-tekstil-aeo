"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, RotateCcw, FileSpreadsheet, FileText } from "lucide-react"
import { syncKumasToKalanKumas } from "@/features/kalan-kumas/kalan-kumas-store"
// Types definitions for the roll item and the tracking sheet
export interface RollItem {
  id: number
  topUstundeYazanMt: number
  cikanMt: number | ""
  eksikFazlaMetraj: number
}

export interface KumasTakipSheet {
  id: string
  kumasKodu: string
  gelenMetraj: number
  kumasciFirma: string
  geldigiTarih: string
  sezon: string
  sapKodu?: string
  baglandigiModel: string
  etiket?: "Academia" | "Beymen Collection" | "Beymen Club" | ""
  kullanildigiYer: "ANA KUMAŞ" | "ASTAR" | "GARNİ" | ""
  birim: "MT" | "KG"
  topAdedi: number
  rolls: RollItem[]
  kumasIcerik?: string
  kumasRenk?: string
  kumasEn?: string
  cekmeEn?: string
  cekmeBoy?: string
}

interface KumasTakipFormProps {
  initialData?: KumasTakipSheet | null
  onSave: (sheet: KumasTakipSheet) => void
  onNew: () => void
}

export function KumasTakipForm({ initialData, onSave, onNew }: KumasTakipFormProps) {
  // Form states initialized with initialData or defaults
  const [id, setId] = React.useState("")
  const [kumasKodu, setKumasKodu] = React.useState("")
  const [kumasciFirma, setKumasciFirma] = React.useState("")
  const [geldigiTarih, setGeldigiTarih] = React.useState("")
  const [sezon, setSezon] = React.useState("")
  const [sapKodu, setSapKodu] = React.useState("")
  const [baglandigiModel, setBaglandigiModel] = React.useState("")
  const [etiket, setEtiket] = React.useState<"Academia" | "Beymen Collection" | "Beymen Club" | "">("")
  const [kullanildigiYer, setKullanildigiYer] = React.useState<"ANA KUMAŞ" | "ASTAR" | "GARNİ" | "">("")
  const [birim, setBirim] = React.useState<"MT" | "KG">("MT")
  const [topAdedi, setTopAdedi] = React.useState<number>(0)
  const [rolls, setRolls] = React.useState<RollItem[]>([])
  const [isPdfLoading, setIsPdfLoading] = React.useState(false)
  const [kumasIcerik, setKumasIcerik] = React.useState("")
  const [kumasRenk, setKumasRenk] = React.useState("")
  const [kumasEn, setKumasEn] = React.useState("")
  const [cekmeEn, setCekmeEn] = React.useState("")
  const [cekmeBoy, setCekmeBoy] = React.useState("")

  // Watch for initialData updates (loading a sheet)
  React.useEffect(() => {
    if (initialData) {
      setId(initialData.id)
      setKumasKodu(initialData.kumasKodu)
      setKumasciFirma(initialData.kumasciFirma)
      setGeldigiTarih(initialData.geldigiTarih)
      setSezon(initialData.sezon)
      setSapKodu(initialData.sapKodu || "")
      setBaglandigiModel(initialData.baglandigiModel)
      setEtiket(initialData.etiket || "")
      setKullanildigiYer(initialData.kullanildigiYer)
      setBirim(initialData.birim || "MT")
      setTopAdedi(initialData.topAdedi)
      setRolls(initialData.rolls)
      setKumasIcerik(initialData.kumasIcerik || "")
      setKumasRenk(initialData.kumasRenk || "")
      setKumasEn(initialData.kumasEn || "")
      setCekmeEn(initialData.cekmeEn || "")
      setCekmeBoy(initialData.cekmeBoy || "")
    } else {
      handleReset()
    }
  }, [initialData])

  const handleReset = () => {
    setId("")
    setKumasKodu("")
    setKumasciFirma("")
    setGeldigiTarih(new Date().toISOString().split('T')[0])
    setSezon("")
    setSapKodu("")
    setBaglandigiModel("")
    setEtiket("")
    setKullanildigiYer("")
    setTopAdedi(0)
    setRolls([])
    setKumasIcerik("")
    setKumasRenk("")
    setKumasEn("")
    setCekmeEn("")
    setCekmeBoy("")
    onNew()
  }

  const handleSapKoduChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 9)
    setSapKodu(cleaned)
  }

  // Handle Roll Count changes: dynamically generates roll rows
  const handleTopAdediChange = (countVal: string) => {
    const count = Math.max(0, parseInt(countVal) || 0)
    setTopAdedi(count)

    setRolls((prevRolls) => {
      if (count === prevRolls.length) return prevRolls

      if (count > prevRolls.length) {
        // Expand: add new rolls
        const additionalRolls: RollItem[] = Array.from({ length: count - prevRolls.length }, (_, index) => {
          const idNum = prevRolls.length + index + 1
          return {
            id: idNum,
            topUstundeYazanMt: 0,
            cikanMt: "",
            eksikFazlaMetraj: 0,
          }
        })
        return [...prevRolls, ...additionalRolls]
      } else {
        // Shrink: slice rolls
        return prevRolls.slice(0, count)
      }
    })
  }

  // Handle Roll row input changes
  const handleRollChange = (index: number, field: "topUstundeYazanMt" | "cikanMt", value: string) => {
    setRolls((prevRolls) => {
      const updated = [...prevRolls]
      const roll = { ...updated[index] }

      if (field === "topUstundeYazanMt") {
        roll.topUstundeYazanMt = Math.max(0, parseFloat(value) || 0)
      } else if (field === "cikanMt") {
        roll.cikanMt = value === "" ? "" : Math.max(0, parseFloat(value) || 0)
      }

      // Calculate Deficit/Excess: Only if cikanMt is explicitly entered
      if (roll.cikanMt === "" || roll.cikanMt === null || roll.cikanMt === undefined) {
        roll.eksikFazlaMetraj = 0
      } else {
        roll.eksikFazlaMetraj = roll.cikanMt - roll.topUstundeYazanMt
      }

      updated[index] = roll
      return updated
    })
  }

  // Calculate sum of "TOP ÜSTÜNDE YAZAN MT" to update "GELEN METRAJ" dynamically
  const gelenMetraj = React.useMemo(() => {
    return rolls.reduce((sum, roll) => sum + roll.topUstundeYazanMt, 0)
  }, [rolls])

  // Calculate sum of measured meters and net variance
  const cikanMetrajTotal = React.useMemo(() => {
    return rolls.reduce((sum, roll) => sum + (typeof roll.cikanMt === "number" ? roll.cikanMt : 0), 0)
  }, [rolls])

  const eksikFazlaMetrajTotal = React.useMemo(() => {
    return rolls.reduce((sum, roll) => sum + (roll.eksikFazlaMetraj || 0), 0)
  }, [rolls])

  const handleFormSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!kumasKodu) return

    const isNew = !id;
    const generatedId = id || Date.now().toString()
    if (!id) {
      setId(generatedId)
    }

    const sheetData: KumasTakipSheet = {
      id: generatedId,
      kumasKodu,
      gelenMetraj,
      kumasciFirma,
      geldigiTarih,
      sezon,
      etiket,
      sapKodu,
      baglandigiModel,
      kullanildigiYer,
      birim,
      topAdedi,
      rolls,
      kumasIcerik,
      kumasRenk,
      kumasEn,
      cekmeEn,
      cekmeBoy,
    }
    
    // Senkronizasyon: Kalan Kumaş tablosuna sadece ilk kayıtta yansıt
    if (isNew) {
      syncKumasToKalanKumas({
        faturaNo: "",
        malzemeKodu: "",
        faturaTarih: "",
        birimFiyat: "",
        depoyaGirisTarihi: geldigiTarih,
        kumasKodu,
        kumasMetraji: `${gelenMetraj.toFixed(2).replace('.', ',')} ${birim === "MT" ? "Mt" : "Kg"}`,
        takipFoyuId: sheetData.id
      })
    }

    onSave(sheetData)
  }

  // PDF Export — fully programmatic via jsPDF
  const handleDownloadPDF = async () => {
    setIsPdfLoading(true)
    await new Promise(r => setTimeout(r, 80))

    try {
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF("p", "mm", "a4")

      // ── Load Turkish-capable font (Noto Sans) ───────────────────────
      const loadFont = async (path: string): Promise<string> => {
        const res = await fetch(path)
        const buf = await res.arrayBuffer()
        const bytes = new Uint8Array(buf)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
        return btoa(binary)
      }

      const [fontRegular, fontBold] = await Promise.all([
        loadFont("/fonts/NotoSans-Regular.ttf"),
        loadFont("/fonts/NotoSans-Bold.ttf"),
      ])

      pdf.addFileToVFS("NotoSans-Regular.ttf", fontRegular)
      pdf.addFont("NotoSans-Regular.ttf", "NotoSans", "normal")
      pdf.addFileToVFS("NotoSans-Bold.ttf", fontBold)
      pdf.addFont("NotoSans-Bold.ttf", "NotoSans", "bold")
      pdf.setFont("NotoSans", "normal")

      // ── Page constants ──────────────────────────────────────────────
      const PH = 297
      const M  = 10                  // margin
      const CW = 190                 // content width  (210 - 2*10)

      // ── Color palette ───────────────────────────────────────────────
      const BLUE:     [number,number,number] = [2,   132, 199]
      const YELLOW:   [number,number,number] = [251, 191, 36]
      const YELLLT:   [number,number,number] = [253, 224, 71]
      const WHITE:    [number,number,number] = [255, 255, 255]
      const GRAY:     [number,number,number] = [243, 244, 246]
      const GRAYLT:   [number,number,number] = [250, 250, 250]
      const GRAYVAL:  [number,number,number] = [245, 245, 245]
      const SKYLT:    [number,number,number] = [224, 242, 254]
      const SKYMD:    [number,number,number] = [56,  189, 248]
      const BORDER:   [number,number,number] = [212, 212, 212]
      const DARK:     [number,number,number] = [23,  23,  23]
      const MID:      [number,number,number] = [75,  85,  99]
      const RED:      [number,number,number] = [185, 28,  28]
      const REDLT:    [number,number,number] = [254, 226, 226]
      const GREEN:    [number,number,number] = [4,   120, 87]
      const GREENLT:  [number,number,number] = [209, 250, 229]

      // ── Helpers ─────────────────────────────────────────────────────
      let curY = M

      const newPageIfNeeded = (neededH: number) => {
        if (curY + neededH > PH - M) {
          pdf.addPage()
          curY = M
        }
      }

      const fillRect = (x: number, y: number, w: number, h: number, rgb: [number,number,number]) => {
        pdf.setFillColor(...rgb)
        pdf.rect(x, y, w, h, "F")
      }

      const strokeRect = (x: number, y: number, w: number, h: number) => {
        pdf.setDrawColor(...BORDER)
        pdf.setLineWidth(0.2)
        pdf.rect(x, y, w, h, "S")
      }

      /** Draw a single table cell with background fill, border, and centred text */
      const cell = (
        x: number, y: number, w: number, h: number,
        text: string,
        opts: {
          bg?:    [number,number,number]
          fg?:    [number,number,number]
          bold?:  boolean
          size?:  number
          align?: "left"|"center"|"right"
        } = {}
      ) => {
        const bg    = opts.bg    ?? WHITE
        const fg    = opts.fg    ?? DARK
        const size  = opts.size  ?? 8
        const align = opts.align ?? "center"

        fillRect(x, y, w, h, bg)
        strokeRect(x, y, w, h)

        if (!text && text !== "0") return

        pdf.setFontSize(size)
        pdf.setFont("NotoSans", opts.bold ? "bold" : "normal")
        pdf.setTextColor(...fg)

        // Vertical centre: baseline offset is roughly size * 0.35 pt in mm (at 72dpi)
        const baselineOffsetMm = (size * 25.4) / 72 * 0.35
        const ty = y + h / 2 + baselineOffsetMm

        const tx = align === "center" ? x + w / 2
                 : align === "right"  ? x + w - 2
                 :                      x + 2.5

        const lines = text.split("\n")
        if (lines.length === 1) {
          pdf.text(text, tx, ty, { align, maxWidth: w - 3 })
        } else {
          // Multi-line: distribute evenly
          const lineGap = (size * 25.4) / 72 * 1.3
          const totalH  = (lines.length - 1) * lineGap
          let lY = y + h / 2 - totalH / 2 + baselineOffsetMm
          lines.forEach(line => {
            pdf.text(line, tx, lY, { align, maxWidth: w - 3 })
            lY += lineGap
          })
        }
      }

      // ── Row heights ─────────────────────────────────────────────────
      const R_LOGO   = 11
      const R_HDR    = 6
      const R_VAL    = 8
      const R_TBLHDR = 7
      const R_ROW    = 6.5
      const R_DET    = 7

      // ── Column widths ───────────────────────────────────────────────
      const c4 = CW / 4   // 47.5 mm  (4-col sections)
      const c5 = CW / 5   // 38 mm    (5-col section)
      // Roll table: fixed widths summing to CW=190
      const RC = [22, 60, 57, 51] as const
      const RX = [M, M+22, M+82, M+139] as const

      // ════════════════════════════════════════════════════════════════
      // SECTION 1 — Company header
      // ════════════════════════════════════════════════════════════════
      cell(M,         curY, c4,        R_LOGO, "GZL TEKSTİL",     { bg: YELLOW, bold: true, size: 10 })
      cell(M + c4,    curY, CW - c4,   R_LOGO, "KUMAŞ TAKİP FÖYÜ",{ bg: YELLLT, bold: true, size: 13 })
      curY += R_LOGO

      // ════════════════════════════════════════════════════════════════
      // SECTION 2 — First info block (5 cols)
      // ════════════════════════════════════════════════════════════════
      const hdrs2 = ["KUMAŞ KODU", `GELEN ${birim === "MT" ? "METRAJ" : "KİLO"}`, "KUMAŞÇI FİRMA", "GELDİĞİ TARİH", "ETİKET"]
      hdrs2.forEach((h, i) =>
        cell(M + i * c5, curY, c5, R_HDR, h, { bg: BLUE, fg: WHITE, bold: true, size: 7 })
      )
      curY += R_HDR

      const metrajStr = `${gelenMetraj.toFixed(2).replace(".", ",")} ${birim.toLowerCase()}`
      const tarihStr  = geldigiTarih ? new Date(geldigiTarih).toLocaleDateString("tr-TR") : "-"
      cell(M,          curY, c5, R_VAL, kumasKodu,    { bold: true, size: 9 })
      cell(M + c5,     curY, c5, R_VAL, metrajStr,    { bg: GRAY,   bold: true, size: 9 })
      cell(M + 2 * c5, curY, c5, R_VAL, kumasciFirma, { align: "left", size: 8 })
      cell(M + 3 * c5, curY, c5, R_VAL, tarihStr,     { size: 8 })
      cell(M + 4 * c5, curY, c5, R_VAL, etiket || "-", { size: 8 })
      curY += R_VAL

      // ════════════════════════════════════════════════════════════════
      // SECTION 3 — Second info block (5 cols: sezon, sap, model, yer, adet)
      // ════════════════════════════════════════════════════════════════
      const hdrs3 = ["SEZON", "SAP KODU", "BAĞLANDIĞI MODEL", "KULLANILDIĞI YER", "TOP ADEDİ"]
      hdrs3.forEach((h, i) =>
        cell(M + i * c5, curY, c5, R_HDR, h, { bg: BLUE, fg: WHITE, bold: true, size: 7 })
      )
      curY += R_HDR

      const vals3 = [sezon, sapKodu || "-", baglandigiModel, kullanildigiYer, String(topAdedi)]
      vals3.forEach((v, i) =>
        cell(M + i * c5, curY, c5, R_VAL, v, { bold: i === 4, size: 8 })
      )
      curY += R_VAL

      curY += 4  // gap before roll table

      // ════════════════════════════════════════════════════════════════
      // SECTION 4 — Roll table
      // ════════════════════════════════════════════════════════════════
      newPageIfNeeded(R_TBLHDR + topAdedi * R_ROW + R_ROW + 2)

      // Table headers
      const tblHdrs = ["TOP NO", `TOP ÜSTÜNDE\nYAZAN ${birim === "MT" ? "MT" : "KG"}`, `ÇIKAN ${birim === "MT" ? "MT" : "KG"}`, `EKSİK /\nFAZLA ${birim === "MT" ? "METRAJ" : "KİLO"}`]
      tblHdrs.forEach((h, i) =>
        cell(RX[i], curY, RC[i], R_TBLHDR, h, { bg: GRAY, bold: true, size: 7 })
      )
      curY += R_TBLHDR

      // Roll rows — one per topAdedi
      for (let i = 0; i < topAdedi; i++) {
        newPageIfNeeded(R_ROW + 20)

        const roll = i < rolls.length ? rolls[i] : null
        const yazanStr = roll ? roll.topUstundeYazanMt.toFixed(2).replace(".", ",") : ""
        const cikanStr = roll && typeof roll.cikanMt === "number"
          ? (roll.cikanMt as number).toFixed(2).replace(".", ",") : ""

        let varBg: [number,number,number] = GRAYVAL
        let varFg: [number,number,number] = MID
        let varStr = ""
        if (roll && typeof roll.cikanMt === "number") {
          const v = roll.eksikFazlaMetraj
          varStr = `${v >= 0 ? "+" : ""}${v.toFixed(2).replace(".", ",")}`
          if (v < 0) { varBg = REDLT;   varFg = RED   }
          else if (v > 0) { varBg = GREENLT; varFg = GREEN }
          else { varBg = GRAYVAL }
        }

        cell(RX[0], curY, RC[0], R_ROW, `TOP ${i + 1}`, { bg: GRAYLT, bold: true, size: 7 })
        cell(RX[1], curY, RC[1], R_ROW, yazanStr,        { size: 7 })
        cell(RX[2], curY, RC[2], R_ROW, cikanStr,        { size: 7 })
        cell(RX[3], curY, RC[3], R_ROW, varStr,          { bg: varBg, fg: varFg, bold: !!varStr, size: 7 })
        curY += R_ROW
      }

      // Total row
      let totFg: [number,number,number] = MID
      if (eksikFazlaMetrajTotal < 0) totFg = RED
      else if (eksikFazlaMetrajTotal > 0) totFg = GREEN
      const totStr = `${eksikFazlaMetrajTotal >= 0 ? "+" : ""}${eksikFazlaMetrajTotal.toFixed(2).replace(".", ",")}`

      cell(RX[0], curY, RC[0], R_ROW + 1, "TOPLAM",                                     { bg: GRAY, bold: true, size: 8 })
      cell(RX[1], curY, RC[1], R_ROW + 1, gelenMetraj.toFixed(2).replace(".", ","),      { bg: GRAY, bold: true, size: 8 })
      cell(RX[2], curY, RC[2], R_ROW + 1, cikanMetrajTotal.toFixed(2).replace(".", ","), { bg: GRAY, bold: true, size: 8 })
      cell(RX[3], curY, RC[3], R_ROW + 1, totStr,                                        { bg: GRAY, fg: totFg, bold: true, size: 8 })
      curY += R_ROW + 1

      curY += 4  // gap

      // ════════════════════════════════════════════════════════════════
      // SECTION 5 — Fabric detail rows
      // ════════════════════════════════════════════════════════════════
      newPageIfNeeded(R_DET * 5 + 5)

      const DL = c4          // detail label col width
      const DV = c4          // detail value col width
      const DN = c4          // "NUMUNE:" label col width
      const DA = CW - DL - DV - DN  // YAPIŞTIRILACAK col width

      // KUMAŞ İÇERİK row (label + full remaining width)
      cell(M,      curY, DL,        R_DET, "KUMAŞ İÇERİK:", { bg: GRAY, bold: true, size: 7 })
      cell(M + DL, curY, CW - DL,   R_DET, kumasIcerik,      { bg: SKYMD, bold: true, size: 8 })
      curY += R_DET

      // 4-row block (left two cols) + spanning NUMUNE block (right two cols)
      const blockY = curY
      const blockH = R_DET * 4

      const detRows: { label: string; value: string; vBg: [number,number,number] }[] = [
        { label: "KUMAŞ RENK", value: kumasRenk,                           vBg: SKYLT },
        { label: "KUMAŞ EN",   value: kumasEn,                             vBg: SKYLT },
        { label: "ÇEKME EN",   value: cekmeEn  ? `${cekmeEn}%`  : "",     vBg: SKYMD },
        { label: "ÇEKME BOY",  value: cekmeBoy ? `${cekmeBoy}%` : "",     vBg: SKYMD },
      ]

      detRows.forEach(({ label, value, vBg }) => {
        cell(M,      curY, DL, R_DET, label, { bg: GRAY,  bold: true, size: 7 })
        cell(M + DL, curY, DV, R_DET, value, { bg: vBg,   bold: true, size: 8 })
        curY += R_DET
      })

      // NUMUNE label — spans all 4 rows
      const numuneX = M + DL + DV
      fillRect(numuneX, blockY, DN, blockH, GRAY)
      strokeRect(numuneX, blockY, DN, blockH)
      pdf.setFontSize(7)
      pdf.setFont("NotoSans", "bold")
      pdf.setTextColor(...DARK)
      pdf.text("KUMAŞ\nNUMUNESİ:", numuneX + DN / 2, blockY + blockH / 2 - 1, { align: "center" })

      // YAPIŞTIRILACAK — spans all 4 rows (blank area)
      const attachX = numuneX + DN
      fillRect(attachX, blockY, DA, blockH, GRAYVAL)
      strokeRect(attachX, blockY, DA, blockH)

      // ── Save ────────────────────────────────────────────────────────
      pdf.save(`kumas-takip-foy-${kumasKodu || "yeni"}.pdf`)

    } catch (err) {
      console.error("PDF export error:", err)
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Excel Export utilising exceljs with custom style fills
  const handleDownloadExcel = async () => {
    try {
      const ExcelJS = (await import("exceljs")).default
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Kumaş Takip Föyü")

      worksheet.views = [{ showGridLines: true }]

      // Helper function to style cells and borders
      const styleCell = (
        cellRef: string,
        value: any,
        options: {
          bg?: string
          color?: string
          bold?: boolean
          size?: number
          align?: "center" | "left" | "right"
          numFormat?: string
        } = {}
      ) => {
        const cell = worksheet.getCell(cellRef)
        cell.value = value
        cell.font = {
          name: "Arial",
          size: options.size || 10,
          bold: !!options.bold,
          color: options.color ? { argb: options.color.replace("#", "") } : undefined,
        }
        if (options.bg) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: options.bg.replace("#", "") },
          }
        }
        cell.alignment = {
          vertical: "middle",
          horizontal: options.align || "center",
          wrapText: true,
        }
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        }
        if (options.numFormat) {
          cell.numFmt = options.numFormat
        }
        return cell
      }

      // Define columns as exactly 5 columns matching the UI's 5-item blocks
      worksheet.columns = [
        { key: "colA", width: 18 },
        { key: "colB", width: 22 },
        { key: "colC", width: 22 },
        { key: "colD", width: 20 },
        { key: "colE", width: 18 },
      ]

      // Row 1: Header
      styleCell("A1", "GZL TEKSTİL", { bg: "#fbbf24", bold: true, size: 11 })
      worksheet.mergeCells("B1:E1")
      styleCell("B1", "KUMAŞ TAKİP FÖYÜ", { bg: "#fde047", bold: true, size: 12 })
      worksheet.getRow(1).height = 32

      // Row 2: Headers (Block 1)
      styleCell("A2", "KUMAŞ KODU", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("B2", `GELEN ${birim === "MT" ? "METRAJ" : "KİLO"}`, { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("C2", "KUMAŞÇI FİRMA", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("D2", "GELDİĞİ TARİH", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("E2", "ETİKET", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      worksheet.getRow(2).height = 24

      // Row 3: Values (Block 1)
      styleCell("A3", kumasKodu, { bold: true })
      styleCell("B3", gelenMetraj, { bg: "#f5f5f5", numFormat: "#,##0.00", bold: true })
      styleCell("C3", kumasciFirma, { align: "left" })
      styleCell("D3", geldigiTarih ? new Date(geldigiTarih).toLocaleDateString("tr-TR") : "")
      styleCell("E3", etiket || "")
      worksheet.getRow(3).height = 28

      // Row 4: Headers (Block 2)
      styleCell("A4", "SEZON", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("B4", "SAP KODU", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("C4", "BAĞLANDIĞI MODEL", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("D4", "KULLANILDIĞI YER", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      styleCell("E4", "TOP ADEDİ", { bg: "#0284c7", color: "#ffffff", bold: true, size: 9 })
      worksheet.getRow(4).height = 24

      // Row 5: Values (Block 2)
      styleCell("A5", sezon)
      styleCell("B5", sapKodu)
      styleCell("C5", baglandigiModel)
      styleCell("D5", kullanildigiYer)
      styleCell("E5", topAdedi, { bold: true })
      worksheet.getRow(5).height = 28

      // Row 6: Empty spacing row
      worksheet.getRow(6).height = 15

      // Row 7: Roll table headers (merge E into D to cleanly fit 4-col data in 5-col grid)
      worksheet.mergeCells("D7:E7")
      styleCell("A7", "TOP NO", { bg: "#f3f4f6", bold: true, size: 9 })
      styleCell("B7", `TOP ÜSTÜNDE YAZAN ${birim === "MT" ? "MT" : "KG"}`, { bg: "#f3f4f6", bold: true, size: 9 })
      styleCell("C7", `ÇIKAN ${birim === "MT" ? "MT" : "KG"}`, { bg: "#f3f4f6", bold: true, size: 9 })
      styleCell("D7", `EKSİK / FAZLA ${birim === "MT" ? "METRAJ" : "KİLO"}`, { bg: "#f3f4f6", bold: true, size: 9 })
      worksheet.getRow(7).height = 24

      // Row 8+: Roll rows — exactly topAdedi rows (no padding to 20)
      let currentRow = 8
      const maxRollsRows = topAdedi
      for (let i = 0; i < maxRollsRows; i++) {
        const roll = i < rolls.length ? rolls[i] : null
        worksheet.mergeCells(`D${currentRow}:E${currentRow}`)
        if (roll) {
          styleCell(`A${currentRow}`, `TOP ${i + 1}`, { bg: "#fafafa", size: 9, bold: true })
          styleCell(`B${currentRow}`, roll.topUstundeYazanMt, { numFormat: "#,##0.00" })
          styleCell(`C${currentRow}`, typeof roll.cikanMt === "number" ? roll.cikanMt : 0, { numFormat: "#,##0.00" })

          // Variance coloring conditional checks
          let varBg = "#f5f5f5"
          let varColor = "#4b5563"
          if (typeof roll.cikanMt === "number") {
            if (roll.eksikFazlaMetraj < 0) {
              varBg = "#fee2e2" // light red
              varColor = "#b91c1c" // dark red
            } else if (roll.eksikFazlaMetraj > 0) {
              varBg = "#d1fae5" // light green
              varColor = "#047857" // dark green
            }
          }
          styleCell(`D${currentRow}`, typeof roll.cikanMt === "number" ? roll.eksikFazlaMetraj : "-", {
            bg: varBg,
            color: varColor,
            bold: true,
            numFormat: typeof roll.cikanMt !== "number" ? undefined : "+#,##0.00;-#,##0.00;0.00",
          })
        } else {
          // Render empty placeholder row matching the template
          styleCell(`A${currentRow}`, `TOP ${i + 1}`, { bg: "#fafafa", size: 9, bold: true })
          styleCell(`B${currentRow}`, "", {})
          styleCell(`C${currentRow}`, "", {})
          styleCell(`D${currentRow}`, "", {})
        }
        worksheet.getRow(currentRow).height = 24
        currentRow++
      }

      // Summary Totals Row — merge A:B for label, D:E for variance
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`)
      styleCell(`A${currentRow}`, "TOPLAM", { bg: "#f3f4f6", bold: true, size: 10 })
      styleCell(`C${currentRow}`, gelenMetraj, { bg: "#f3f4f6", bold: true, numFormat: "#,##0.00" })
      styleCell(`D${currentRow}`, cikanMetrajTotal, { bg: "#f3f4f6", bold: true, numFormat: "#,##0.00" })

      let totalVarColor = "#4b5563"
      if (eksikFazlaMetrajTotal < 0) totalVarColor = "#b91c1c"
      else if (eksikFazlaMetrajTotal > 0) totalVarColor = "#047857"

      styleCell(`E${currentRow}`, eksikFazlaMetrajTotal, {
        bg: "#f3f4f6",
        color: totalVarColor,
        bold: true,
        numFormat: "+#,##0.00;-#,##0.00;0.00",
      })
      worksheet.getRow(currentRow).height = 26
      currentRow++

      // 1. KUMAŞ İÇERİK: row
      styleCell(`A${currentRow}`, "KUMAŞ İÇERİK:", { bg: "#f3f4f6", bold: true, size: 9 })
      worksheet.mergeCells(`B${currentRow}:E${currentRow}`)
      styleCell(`B${currentRow}`, kumasIcerik, { bg: "#38bdf8", bold: true, color: "#000000", size: 9 })
      worksheet.getRow(currentRow).height = 26
      currentRow++

      // 2. KUMAŞ RENK row (holds values + start of row spans)
      const startDetailRow = currentRow
      styleCell(`A${currentRow}`, "KUMAŞ RENK", { bg: "#f3f4f6", bold: true, size: 9 })
      styleCell(`B${currentRow}`, kumasRenk, { bg: "#e0f2fe", bold: true, color: "#000000", size: 9 })

      // KUMAŞ NUMUNESİ label spans C:D across 4 rows
      worksheet.mergeCells(`C${startDetailRow}:D${startDetailRow + 3}`)
      styleCell(`C${startDetailRow}`, "KUMAŞ NUMUNESİ:", { bg: "#f3f4f6", bold: true, size: 9 })

      // YAPIŞTIRILACAK note spans E across 4 rows (blank area)
      worksheet.mergeCells(`E${startDetailRow}:E${startDetailRow + 3}`)
      styleCell(`E${startDetailRow}`, "", {
        bg: "#f5f5f5",
        size: 9,
        align: "center",
      })
      worksheet.getRow(currentRow).height = 24
      currentRow++

      // 3. KUMAŞ EN row
      styleCell(`A${currentRow}`, "KUMAŞ EN", { bg: "#f3f4f6", bold: true, size: 9 })
      styleCell(`B${currentRow}`, kumasEn, { bg: "#e0f2fe", bold: true, color: "#000000", size: 9 })
      worksheet.getRow(currentRow).height = 24
      currentRow++

      // 4. ÇEKME EN row — append % sign
      styleCell(`A${currentRow}`, "ÇEKME EN", { bg: "#f3f4f6", bold: true, size: 9 })
      styleCell(`B${currentRow}`, cekmeEn !== "" ? `${cekmeEn}%` : "", { bg: "#38bdf8", bold: true, color: "#000000", size: 9 })
      worksheet.getRow(currentRow).height = 24
      currentRow++

      // 5. ÇEKME BOY row — append % sign
      styleCell(`A${currentRow}`, "ÇEKME BOY", { bg: "#f3f4f6", bold: true, size: 9 })
      styleCell(`B${currentRow}`, cekmeBoy !== "" ? `${cekmeBoy}%` : "", { bg: "#38bdf8", bold: true, color: "#000000", size: 9 })
      worksheet.getRow(currentRow).height = 24

      // Style merged cells — now C:E and F
      for (let r = startDetailRow; r <= startDetailRow + 3; r++) {
        for (const col of ["C", "D", "E", "F"]) {
          const cellX = worksheet.getCell(`${col}${r}`)
          cellX.border = {
            top: { style: "thin", color: { argb: "FFD4D4D4" } },
            left: { style: "thin", color: { argb: "FFD4D4D4" } },
            bottom: { style: "thin", color: { argb: "FFD4D4D4" } },
            right: { style: "thin", color: { argb: "FFD4D4D4" } },
          }
        }
      }

      const sampleLabelCell = worksheet.getCell(`C${startDetailRow}`)
      sampleLabelCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }

      const sampleInstructCell = worksheet.getCell(`F${startDetailRow}`)
      sampleInstructCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
      sampleInstructCell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FFDC2626" }, underline: true }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `kumas-takip-foy-${kumasKodu || "yeni"}.xlsx`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Excel export error:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons top bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white border border-neutral-200/80 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-semibold border-neutral-200 text-neutral-600 hover:bg-neutral-50 h-9 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            Yeni Föy Oluştur
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadExcel}
            disabled={!kumasKodu}
            className="flex items-center gap-2 text-xs font-semibold border-neutral-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 h-9 rounded-xl disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel İndir
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={!kumasKodu}
            className="flex items-center gap-2 text-xs font-semibold border-neutral-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 h-9 rounded-xl disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            PDF İndir
          </Button>
        </div>
        <Button
          type="button"
          onClick={handleFormSave}
          disabled={!kumasKodu}
          className="flex items-center gap-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow h-9 rounded-xl px-4 w-full sm:w-auto justify-center disabled:opacity-50"
        >
          {id ? "Föyü Güncelle" : "Föyü Kaydet"}
        </Button>
      </div>

      {/* Main Excel grid card container */}
      <Card className="border border-neutral-200/90 shadow-lg shadow-neutral-100/50 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0 select-none">
          {/* Header row mirroring the Excel yellow header layout */}
          <div className="flex border-b-2 border-neutral-400">
            <div className="w-1/4 bg-yellow-400 border-r-2 border-neutral-400 px-4 py-2 flex items-center justify-center text-[10px] font-black tracking-widest uppercase text-center text-neutral-900">
              GZL TEKSTİL
            </div>
            <div className="w-3/4 bg-yellow-300 px-4 py-2 flex items-center justify-center text-[13px] font-black tracking-[0.2em] uppercase text-center text-neutral-900">
              KUMAŞ TAKİP FÖYÜ
            </div>
          </div>

          <form onSubmit={handleFormSave} className="divide-y divide-neutral-200">
            {/* =======================================================
                 DESKTOP LAYOUT (EXCEL STYLE GRID) - Hides on Mobile
               ======================================================= */}
            <div className="hidden md:block">
              {/* Grid Row 1: Headers */}
              <div className="grid grid-cols-5 bg-sky-600 text-white font-bold text-[10px] tracking-wider uppercase text-center">
                <div className="px-3 py-2 border-r border-white/20">Kumaş Kodu</div>
                <div className="px-3 py-2 border-r border-white/20">Gelen Miktar</div>
                <div className="px-3 py-2 border-r border-white/20">Kumaşçı Firma</div>
                <div className="px-3 py-2 border-r border-white/20">Geldiği Tarih</div>
                <div className="px-3 py-2">Etiket</div>
              </div>

              {/* Grid Row 2: Inputs */}
              <div className="grid grid-cols-5 text-[11px] font-semibold text-center border-b border-neutral-200">
                <div className="border-r border-neutral-200 p-2 flex items-center">
                  <Input
                    value={kumasKodu}
                    onChange={(e) => setKumasKodu(e.target.value.toUpperCase())}
                    placeholder="örn. MZ777"
                    className="h-9 text-[11px] font-semibold text-center border-neutral-200 bg-white text-neutral-800"
                    required
                  />
                </div>
                <div className="border-r border-neutral-200 p-2 flex items-center justify-center gap-1 font-semibold text-[11px] text-neutral-700 bg-neutral-100/50">
                  <span>{gelenMetraj.toFixed(2).replace('.', ',')}</span>
                  <select 
                    value={birim} 
                    onChange={(e) => setBirim(e.target.value as "MT" | "KG")}
                    className="h-7 px-1 py-0.5 rounded border border-neutral-300 bg-white text-[11px] font-semibold text-neutral-700 outline-none cursor-pointer"
                  >
                    <option value="MT">MT</option>
                    <option value="KG">KG</option>
                  </select>
                </div>
                <div className="border-r border-neutral-200 p-2 flex items-center">
                  <Input
                    value={kumasciFirma}
                    onChange={(e) => setKumasciFirma(e.target.value)}
                    placeholder="örn. Zeki Kumaşçılık"
                    className="h-9 text-[11px] font-semibold text-center border-neutral-200 bg-white text-neutral-700"
                  />
                </div>
                <div className="border-r border-neutral-200 p-2 flex items-center">
                  <Input
                    type="date"
                    value={geldigiTarih}
                    onChange={(e) => setGeldigiTarih(e.target.value)}
                    className="h-9 text-[11px] font-semibold text-center border-neutral-200 bg-white text-neutral-700 w-full"
                  />
                </div>
                <div className="p-2 flex items-center">
                  <select
                    value={etiket}
                    onChange={(e) => setEtiket(e.target.value as any)}
                    className="w-full h-9 px-3 text-[11px] font-semibold text-center rounded-lg border border-neutral-200 bg-white text-neutral-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Academia">Academia</option>
                    <option value="Beymen Collection">Beymen Collection</option>
                    <option value="Beymen Club">Beymen Club</option>
                  </select>
                </div>
              </div>

              {/* Grid Row 3: Headers */}
              <div className="grid grid-cols-5 bg-sky-600 text-white font-bold text-[10px] tracking-wider uppercase text-center">
                <div className="px-3 py-2 border-r border-white/20">Sezon</div>
                <div className="px-3 py-2 border-r border-white/20">SAP KODU</div>
                <div className="px-3 py-2 border-r border-white/20">Bağlandığı Model</div>
                <div className="px-3 py-2 border-r border-white/20">Kullanıldığı Yer</div>
                <div className="px-3 py-2">Top Adedi</div>
              </div>

              {/* Grid Row 4: Inputs */}
              <div className="grid grid-cols-5 text-[11px] font-semibold text-center">
                <div className="border-r border-neutral-200 p-2 flex items-center">
                  <Input
                    value={sezon}
                    onChange={(e) => setSezon(e.target.value.toUpperCase())}
                    placeholder="örn. SS23"
                    className="h-9 text-[11px] font-semibold text-center border-neutral-200 bg-white text-neutral-700"
                  />
                </div>
                <div className="border-r border-neutral-200 p-2 flex items-center">
                  <Input
                    value={sapKodu}
                    onChange={(e) => handleSapKoduChange(e.target.value)}
                    placeholder="örn. 123456789"
                    maxLength={9}
                    className="h-9 text-[11px] font-semibold text-center border-neutral-200 bg-white text-neutral-700"
                  />
                </div>
                <div className="border-r border-neutral-200 p-2 flex items-center">
                  <Input
                    value={baglandigiModel}
                    onChange={(e) => setBaglandigiModel(e.target.value.toUpperCase())}
                    placeholder="örn. CSA1234"
                    className="h-9 text-[11px] font-semibold text-center border-neutral-200 bg-white text-neutral-700"
                  />
                </div>
                <div className="border-r border-neutral-200 p-2 flex items-center">
                  <select
                    value={kullanildigiYer}
                    onChange={(e) => setKullanildigiYer(e.target.value as any)}
                    className="w-full h-9 px-3 text-[11px] font-semibold text-center rounded-lg border border-neutral-200 bg-white text-neutral-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  >
                    <option value="">Seçiniz...</option>
                    <option value="ANA KUMAŞ">ANA KUMAŞ</option>
                    <option value="ASTAR">ASTAR</option>
                    <option value="GARNİ">GARNİ</option>
                  </select>
                </div>
                <div className="p-2 flex items-center">
                  <Input
                    type="number"
                    min="0"
                    value={topAdedi === 0 ? "" : topAdedi}
                    onChange={(e) => handleTopAdediChange(e.target.value)}
                    placeholder="örn. 6"
                    className="h-9 text-[11px] font-semibold text-center border-neutral-200 bg-white text-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* =======================================================
                 MOBILE LAYOUT (MODERN APP FORM) - Hides on Desktop
               ======================================================= */}
            <div className="block md:hidden bg-neutral-50/50 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Kumaş Kodu</Label>
                  <Input
                    value={kumasKodu}
                    onChange={(e) => setKumasKodu(e.target.value.toUpperCase())}
                    placeholder="örn. MZ777"
                    className="h-10 text-sm border-neutral-300 bg-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Gelen Miktar</Label>
                  <div className="h-10 flex items-center justify-between px-3 rounded-lg border border-neutral-200 bg-neutral-100/50 font-bold text-sm text-neutral-700">
                    <span>{gelenMetraj.toFixed(2).replace('.', ',')}</span>
                    <select 
                      value={birim} 
                      onChange={(e) => setBirim(e.target.value as "MT" | "KG")}
                      className="h-7 px-1 py-0.5 rounded border border-neutral-300 bg-white text-xs text-neutral-700 font-bold outline-none cursor-pointer"
                    >
                      <option value="MT">MT</option>
                      <option value="KG">KG</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Geldiği Tarih</Label>
                  <Input
                    type="date"
                    value={geldigiTarih}
                    onChange={(e) => setGeldigiTarih(e.target.value)}
                    className="h-10 text-sm border-neutral-300 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Etiket</Label>
                  <select
                    value={etiket}
                    onChange={(e) => setEtiket(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-neutral-300 bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Academia">Academia</option>
                    <option value="Beymen Collection">Beymen Collection</option>
                    <option value="Beymen Club">Beymen Club</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Kumaşçı Firma</Label>
                <Input
                  value={kumasciFirma}
                  onChange={(e) => setKumasciFirma(e.target.value)}
                  placeholder="örn. Zeki Kumaşçılık"
                  className="h-10 text-sm border-neutral-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Sezon</Label>
                  <Input
                    value={sezon}
                    onChange={(e) => setSezon(e.target.value.toUpperCase())}
                    placeholder="örn. SS23"
                    className="h-10 text-sm border-neutral-300 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">SAP Kodu</Label>
                  <Input
                    value={sapKodu}
                    onChange={(e) => handleSapKoduChange(e.target.value)}
                    placeholder="örn. 123456789"
                    maxLength={9}
                    className="h-10 text-sm border-neutral-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Bağlandığı Model</Label>
                  <Input
                    value={baglandigiModel}
                    onChange={(e) => setBaglandigiModel(e.target.value.toUpperCase())}
                    placeholder="örn. CSA1234"
                    className="h-10 text-sm border-neutral-300 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Kullanıldığı Yer</Label>
                  <select
                    value={kullanildigiYer}
                    onChange={(e) => setKullanildigiYer(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-neutral-300 bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  >
                    <option value="">Seçiniz...</option>
                    <option value="ANA KUMAŞ">ANA KUMAŞ</option>
                    <option value="ASTAR">ASTAR</option>
                    <option value="GARNİ">GARNİ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Top Adedi</Label>
                <Input
                  type="number"
                  min="0"
                  value={topAdedi === 0 ? "" : topAdedi}
                  onChange={(e) => handleTopAdediChange(e.target.value)}
                  placeholder="örn. 6"
                  className="h-10 text-sm border-neutral-300 bg-white font-bold"
                />
              </div>
            </div>

            {/* Lower Roll detail dynamic table */}
            <div className="p-4 bg-neutral-50/10">
              <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-center select-none">
                      <th className="px-4 py-3 border-r border-neutral-200 w-24">Top No</th>
                      <th className="px-4 py-3 border-r border-neutral-200">Top Üstünde Yazan {birim === "MT" ? "Mt" : "Kg"}</th>
                      <th className="px-4 py-3 border-r border-neutral-200">Çıkan {birim === "MT" ? "Mt" : "Kg"}</th>
                      <th className="px-4 py-3">Eksik/Fazla {birim === "MT" ? "Metraj" : "Kilo"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-center">
                    {Array.from({ length: topAdedi }).map((_, index) => {
                      const roll = index < rolls.length ? rolls[index] : null
                      if (roll) {
                        const isVarianceNegative = roll.eksikFazlaMetraj < 0
                        const isVariancePositive = roll.eksikFazlaMetraj > 0
                        return (
                          <tr key={roll.id} className="hover:bg-neutral-50/40 transition-colors duration-150">
                            {/* Column 1: Roll Label */}
                            <td className="px-4 py-3 font-semibold text-[11px] text-neutral-600 bg-neutral-50/40 border-r border-neutral-200">
                              TOP {index + 1}
                            </td>

                            {/* Column 2: Written Meters Input */}
                            <td className="px-4 py-2 border-r border-neutral-200">
                              <Input
                                type="number"
                                step="any"
                                min="0"
                                value={roll.topUstundeYazanMt === 0 ? "" : roll.topUstundeYazanMt}
                                onChange={(e) => handleRollChange(index, "topUstundeYazanMt", e.target.value)}
                                className="h-8 text-[11px] text-center border-neutral-200 max-w-[150px] mx-auto font-medium"
                                placeholder="0,00"
                              />
                            </td>

                            {/* Column 3: Measured Meters Input */}
                            <td className="px-4 py-2 border-r border-neutral-200">
                              <Input
                                type="number"
                                step="any"
                                min="0"
                                value={roll.cikanMt ?? ""}
                                onChange={(e) => handleRollChange(index, "cikanMt", e.target.value)}
                                className="h-8 text-[11px] text-center border-neutral-200 max-w-[150px] mx-auto font-medium"
                                placeholder="0,00"
                              />
                            </td>

                            {/* Column 4: Calculated Variance */}
                            <td className="px-4 py-3 font-bold text-[11px]">
                              {typeof roll.cikanMt !== "number" ? (
                                <span className="text-neutral-400 font-medium text-[11px]">-</span>
                              ) : (
                                <span
                                  className={
                                    isVarianceNegative
                                      ? "text-rose-600 bg-rose-50 px-2 py-1 rounded-full text-[11px]"
                                      : isVariancePositive
                                      ? "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[11px]"
                                      : "text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full text-[11px]"
                                  }
                                >
                                  {isVariancePositive ? "+" : ""}
                                  {roll.eksikFazlaMetraj.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      } else {
                        // Render padded empty row matching the template
                        return (
                          <tr key={`pad-${index}`} className="h-11">
                            <td className="px-4 py-3 font-semibold text-[11px] text-neutral-400 bg-neutral-50/40 border-r border-neutral-200 select-none text-center">
                              TOP {index + 1}
                            </td>
                            <td className="px-4 py-2 border-r border-neutral-200"></td>
                            <td className="px-4 py-2 border-r border-neutral-200"></td>
                            <td className="px-4 py-3"></td>
                          </tr>
                        )
                      }
                    })}

                    {/* Summary Totals Row */}
                    <tr className="bg-neutral-50 font-black border-t-2 border-neutral-300 text-[11px]">
                      <td className="px-4 py-3 border-r border-neutral-200 text-neutral-700 text-center uppercase tracking-widest text-[10px]">TOPLAM</td>
                      <td className="px-4 py-3 border-r border-neutral-200 text-neutral-800 text-center">
                        {gelenMetraj.toFixed(2).replace('.', ',')} {birim === "MT" ? "mt" : "kg"}
                      </td>
                      <td className="px-4 py-3 border-r border-neutral-200 text-neutral-800 text-center">
                        {cikanMetrajTotal.toFixed(2).replace('.', ',')} {birim === "MT" ? "mt" : "kg"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            eksikFazlaMetrajTotal < 0
                              ? "text-rose-600"
                              : eksikFazlaMetrajTotal > 0
                              ? "text-emerald-600"
                              : "text-neutral-500"
                          }
                        >
                          {eksikFazlaMetrajTotal > 0 ? "+" : ""}
                          {eksikFazlaMetrajTotal.toFixed(2).replace('.', ',')} {birim === "MT" ? "mt" : "kg"}
                        </span>
                      </td>
                    </tr>

                    {/* KUMAŞ İÇERİK row */}
                    <tr className="border-t border-neutral-300 text-xs font-bold">
                      <td className="bg-neutral-100 text-neutral-800 px-4 py-3 border-r border-neutral-200 text-center uppercase tracking-wider select-none">
                        KUMAŞ İÇERİK:
                      </td>
                      <td colSpan={3} className="bg-sky-400/90 p-0">
                        <input
                          type="text"
                          value={kumasIcerik}
                          onChange={(e) => setKumasIcerik(e.target.value.toUpperCase())}
                          placeholder="örn. %100 POLIESTER"
                          className="w-full h-full min-h-[38px] bg-transparent text-center font-bold text-xs uppercase focus:outline-none border-none py-2 px-3 text-neutral-900 placeholder-neutral-700/60"
                        />
                      </td>
                    </tr>

                    {/* Fabric details grid: RENK, EN, ÇEKME, NUMUNE */}
                    <tr className="border-t border-neutral-200 text-xs font-bold">
                      <td className="bg-neutral-100 text-neutral-800 px-4 py-3 border-r border-neutral-200 text-center uppercase tracking-wider select-none">
                        KUMAŞ RENK
                      </td>
                      <td className="bg-sky-100 p-0 border-r border-neutral-200">
                        <input
                          type="text"
                          value={kumasRenk}
                          onChange={(e) => setKumasRenk(e.target.value.toUpperCase())}
                          placeholder="örn. KIRMIZI"
                          className="w-full h-full min-h-[38px] bg-transparent text-center font-bold text-xs focus:outline-none border-none py-2 px-3 text-neutral-900 placeholder-neutral-500/60"
                        />
                      </td>
                      <td rowSpan={4} className="bg-neutral-100 text-neutral-800 px-4 py-3 border-r border-neutral-200 text-center uppercase tracking-wider align-middle select-none">
                        KUMAŞ NUMUNESİ:
                      </td>
                      <td rowSpan={4} className="bg-neutral-50 p-4 align-middle text-center">
                        {/* Boş Alan - Numune yapıştırılacak */}
                      </td>
                    </tr>

                    <tr className="border-t border-neutral-200 text-xs font-bold">
                      <td className="bg-neutral-100 text-neutral-800 px-4 py-3 border-r border-neutral-200 text-center uppercase tracking-wider select-none">
                        KUMAŞ EN
                      </td>
                      <td className="bg-sky-100 p-0 border-r border-neutral-200">
                        <input
                          type="text"
                          value={kumasEn}
                          onChange={(e) => setKumasEn(e.target.value)}
                          placeholder="örn. 142"
                          className="w-full h-full min-h-[38px] bg-transparent text-center font-bold text-xs focus:outline-none border-none py-2 px-3 text-neutral-900 placeholder-neutral-500/60"
                        />
                      </td>
                    </tr>

                    <tr className="border-t border-neutral-200 text-xs font-bold">
                      <td className="bg-neutral-100 text-neutral-800 px-4 py-3 border-r border-neutral-200 text-center uppercase tracking-wider select-none">
                        ÇEKME EN
                      </td>
                      <td className="bg-sky-400/90 p-0 border-r border-neutral-200">
                        <div className="flex items-center justify-center min-h-[38px] px-3 gap-0">
                          <input
                            type="number"
                            step="0.1"
                            value={cekmeEn}
                            onChange={(e) => setCekmeEn(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent text-center font-bold text-xs focus:outline-none border-none py-2 text-neutral-900 placeholder-neutral-700/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs font-bold text-neutral-900 select-none pr-1">%</span>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-t border-neutral-200 text-xs font-bold">
                      <td className="bg-neutral-100 text-neutral-800 px-4 py-3 border-r border-neutral-200 text-center uppercase tracking-wider select-none">
                        ÇEKME BOY
                      </td>
                      <td className="bg-sky-400/90 p-0 border-r border-neutral-200">
                        <div className="flex items-center justify-center min-h-[38px] px-3 gap-0">
                          <input
                            type="number"
                            step="0.1"
                            value={cekmeBoy}
                            onChange={(e) => setCekmeBoy(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent text-center font-bold text-xs focus:outline-none border-none py-2 text-neutral-900 placeholder-neutral-700/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs font-bold text-neutral-900 select-none pr-1">%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {isPdfLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-10 w-10 text-neutral-800" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-semibold text-neutral-800">PDF Raporu Hazırlanıyor...</p>
            <p className="text-xs text-neutral-400">Lütfen bekleyiniz, sayfa formatlanıyor.</p>
          </div>
        </div>
      )}
    </div>
  )
}
