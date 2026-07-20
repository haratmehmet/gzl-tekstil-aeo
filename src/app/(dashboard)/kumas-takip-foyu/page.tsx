"use client"

import * as React from "react"
import { KumasTakipForm, KumasTakipList, KumasTakipSheet, useKumasTakipStore } from "@/features/kumas-takip"
import { useCekmeStore } from "@/features/cekme-tablosu/useCekmeStore"

// Initial dummy data matching the user's Excel example image
const initialDummySheets: KumasTakipSheet[] = [
  {
    id: "demo-1",
    kumasKodu: "ME777",
    gelenMetraj: 300,
    birim: "MT",
    kumasciFirma: "Zeki Kumaşçılık",
    geldigiTarih: "2026-06-26",
    sezon: "SS23",
    baglandigiModel: "CSA1234",
    kullanildigiYer: "ANA KUMAŞ",
    topAdedi: 6,
    rolls: [
      { id: 1, topUstundeYazanMt: 50, cikanMt: 49.5, eksikFazlaMetraj: -0.5 },
      { id: 2, topUstundeYazanMt: 50, cikanMt: 50, eksikFazlaMetraj: 0 },
      { id: 3, topUstundeYazanMt: 50, cikanMt: 50.2, eksikFazlaMetraj: 0.2 },
      { id: 4, topUstundeYazanMt: 50, cikanMt: 48.8, eksikFazlaMetraj: -1.2 },
      { id: 5, topUstundeYazanMt: 50, cikanMt: 50, eksikFazlaMetraj: 0 },
      { id: 6, topUstundeYazanMt: 50, cikanMt: 51.5, eksikFazlaMetraj: 1.5 },
    ],
    kumasIcerik: "%100 Poliester",
    kumasRenk: "Kırmızı",
    kumasEn: "142",
    cekmeEn: "-2%",
    cekmeBoy: "2%",
    sapKodu: "123456789",
  },
]

export default function KumasTakipFoyuPage() {
  const { sheets, isLoaded: isTakipLoaded, saveSheet, deleteSheet } = useKumasTakipStore()
  const { foyler, isLoaded: isCekmeLoaded, addFoy, updateFoy } = useCekmeStore()
  const [selectedSheet, setSelectedSheet] = React.useState<KumasTakipSheet | null>(null)

  // Yükleme sırasında animasyon göster
  if (!isTakipLoaded || !isCekmeLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] opacity-50">
        <div className="h-8 w-8 border-4 border-neutral-200 border-t-neutral-800 rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-neutral-400">Föyler Yükleniyor...</p>
      </div>
    )
  }

  // Delete sheet and clear selected if active
  const handleDeleteSheet = (id: string) => {
    deleteSheet(id)
    if (selectedSheet?.id === id) {
      setSelectedSheet(null)
    }
  }

  // Save or update sheet
  const handleSaveSheet = (savedSheet: KumasTakipSheet) => {
    const isNew = !sheets.some(s => s.id === savedSheet.id)
    saveSheet(savedSheet)
    setSelectedSheet(savedSheet)

    // Sadece İLK kayıtta (yeni föy oluşturulduğunda) Çekme Tablosuna aktar
    if (isNew) {
      const emptyFabric = { id: "", kullanildigiYer: "", kumasIcerik: "", tedarikci: "", artikelAdi: "", urunDptRenk: "", gelenMetraj: "", kumasEn: "", enCekmeYuzde: "", boyCekmeYuzde: "" }
    
    const baseFabricData = {
      kumasIcerik: savedSheet.kumasIcerik || "",
      tedarikci: savedSheet.kumasciFirma || "",
      urunDptRenk: savedSheet.kumasRenk || "",
      gelenMetraj: savedSheet.gelenMetraj || "",
      kumasEn: savedSheet.kumasEn || "",
      enCekmeYuzde: savedSheet.cekmeEn || "",
      boyCekmeYuzde: savedSheet.cekmeBoy || "",
    }

    let generatedFabrics = []
    const t = Date.now()

    if (savedSheet.kullanildigiYer === "ASTAR") {
      generatedFabrics = [
        { ...emptyFabric, id: t.toString() }, // ANA KUMAŞ empty
        { ...emptyFabric, ...baseFabricData, id: (t + 1).toString(), kullanildigiYer: "ASTAR" }
      ]
    } else if (savedSheet.kullanildigiYer === "GARNİ") {
      generatedFabrics = [
        { ...emptyFabric, id: t.toString() }, // ANA KUMAŞ empty
        { ...emptyFabric, id: (t + 1).toString() }, // ASTAR empty
        { ...emptyFabric, ...baseFabricData, id: (t + 2).toString(), kullanildigiYer: "GARNİ" }
      ]
    } else {
      // Default to ANA KUMAŞ if "ANA KUMAŞ" or empty
      generatedFabrics = [
        { ...emptyFabric, ...baseFabricData, id: t.toString(), kullanildigiYer: savedSheet.kullanildigiYer || "ANA KUMAŞ" }
      ]
    }

    const cekmeRecord = {
      id: savedSheet.id,
      sezon: savedSheet.sezon,
      testeGonderilmeTarihi: savedSheet.geldigiTarih || "",
      modelist: "",
      etiket: savedSheet.etiket || "",
      modelKodu: savedSheet.baglandigiModel || "",
      sapKodu: savedSheet.sapKodu || "",
      kumasKodu: savedSheet.kumasKodu || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fabrics: generatedFabrics
    }

    const getEtiketGroup = (etiket?: string) => {
      if (etiket === "Beymen Club") return "Beymen Club"
      return "Academia & Beymen Collection"
    }

    const existingCekme = foyler.find(f => 
      f.modelKodu === savedSheet.baglandigiModel &&
      f.sezon === savedSheet.sezon &&
      getEtiketGroup(f.etiket) === getEtiketGroup(savedSheet.etiket)
    )

    if (existingCekme) {
      // Merge logic for existing
      const maxLen = Math.max(existingCekme.fabrics?.length || 0, generatedFabrics.length)
      const mergedFabrics = []
      for (let i = 0; i < maxLen; i++) {
        const existFab = existingCekme.fabrics?.[i]
        const genFab = generatedFabrics[i]
        if (!existFab) {
          mergedFabrics.push(genFab)
        } else if (!genFab || !genFab.kullanildigiYer) {
          mergedFabrics.push(existFab)
        } else {
          mergedFabrics.push({
            ...existFab,
            kullanildigiYer: genFab.kullanildigiYer,
            kumasIcerik: genFab.kumasIcerik,
            tedarikci: genFab.tedarikci,
            urunDptRenk: genFab.urunDptRenk,
            gelenMetraj: genFab.gelenMetraj,
            kumasEn: genFab.kumasEn,
            enCekmeYuzde: genFab.enCekmeYuzde,
            boyCekmeYuzde: genFab.boyCekmeYuzde,
          })
        }
      }

      updateFoy(existingCekme.id, {
        ...existingCekme,
        sezon: savedSheet.sezon,
        etiket: savedSheet.etiket || existingCekme.etiket,
        modelKodu: savedSheet.baglandigiModel || existingCekme.modelKodu,
        sapKodu: savedSheet.sapKodu || existingCekme.sapKodu,
        kumasKodu: savedSheet.kumasKodu || existingCekme.kumasKodu,
        fabrics: mergedFabrics
      })
    } else {
      // İlk defa oluşturuluyorsa doğrudan ekle (id olarak Date.now() vb verebiliriz)
      cekmeRecord.id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
      addFoy(cekmeRecord)
    }
    } // End of if (isNew)
  }

  // Start a fresh form
  const handleNewSheet = () => {
    setSelectedSheet(null)
  }

  return (
    <div className="space-y-6">
      {/* Title area */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Kumaş Takip Föyü</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Kumaş üretim, sipariş ve tedarik süreçlerinin detaylı föy takip ekranı.
        </p>
      </div>

      {/* Grid: 2/3 Form and 1/3 List of saved sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KumasTakipForm
            initialData={selectedSheet}
            onSave={handleSaveSheet}
            onNew={handleNewSheet}
          />
        </div>
        <div className="lg:col-span-1">
          <KumasTakipList
            sheets={sheets}
            onSelect={(sheet) => setSelectedSheet(sheet)}
            onDelete={handleDeleteSheet}
            activeId={selectedSheet?.id}
          />
        </div>
      </div>
    </div>
  )
}
