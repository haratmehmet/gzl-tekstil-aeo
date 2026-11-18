"use client"

import * as React from "react"
import { CheckCircle2, X } from "lucide-react"
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
  const [notification, setNotification] = React.useState<{ message: string; show: boolean } | null>(null)
  const notificationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const showNotification = (message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }
    setNotification({ message, show: true })
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

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
  const handleSaveSheet = async (savedSheet: KumasTakipSheet) => {
    // 1. Kumaş Takip sunucu kaydını başlat
    const savePromise = saveSheet(savedSheet)

    // 2. Çekme Tablosu senkronizasyonunu hazırla
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

    // Kumaş türüne göre doğru slot indeksi belirle:
    // ANA KUMAŞ → slot 0, ASTAR → slot 1, GARNİ → slot 2
    const getSlotIndex = (yer: string) => {
      if (yer === "ASTAR") return 1
      if (yer === "GARNİ") return 2
      return 0 // ANA KUMAŞ veya varsayılan
    }

    const slotIndex = getSlotIndex(savedSheet.kullanildigiYer || "ANA KUMAŞ")
    
    // 3 slotluk boş dizi oluştur, sadece doğru slota veriyi yerleştir
    const t = Date.now()
    const generatedFabrics = [0, 1, 2].map((i) => {
      if (i === slotIndex) {
        return { 
          ...emptyFabric, 
          ...baseFabricData, 
          id: (t + i).toString(), 
          kullanildigiYer: savedSheet.kullanildigiYer || "ANA KUMAŞ" 
        }
      }
      return { ...emptyFabric, id: (t + i).toString() }
    })

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

    const cleanModel = savedSheet.baglandigiModel?.trim().toLowerCase()
    const cleanSezon = savedSheet.sezon?.trim().toLowerCase()
    const targetGroup = getEtiketGroup(savedSheet.etiket)

    const existingCekme = cleanModel ? foyler.find(f => 
      f.modelKodu?.trim().toLowerCase() === cleanModel &&
      f.sezon?.trim().toLowerCase() === cleanSezon &&
      getEtiketGroup(f.etiket) === targetGroup
    ) : null

    let cekmePromise: Promise<boolean>
    if (existingCekme) {
      // Slot-bazlı merge: her kumaş türü kendi sabit sütununa yerleşir
      const mergedFabrics = [0, 1, 2].map((i) => {
        const existFab = existingCekme.fabrics?.[i]
        const genFab = generatedFabrics[i]
        
        // Bu slot, yeni eklenen kumaşın slotu mu?
        if (i === slotIndex) {
          // Evet — yeni veriyle güncelle (mevcut veriyi koru, üstüne yaz)
          return {
            ...(existFab || emptyFabric),
            id: genFab.id,
            kullanildigiYer: genFab.kullanildigiYer,
            kumasIcerik: genFab.kumasIcerik,
            tedarikci: genFab.tedarikci,
            urunDptRenk: genFab.urunDptRenk,
            gelenMetraj: genFab.gelenMetraj,
            kumasEn: genFab.kumasEn,
            enCekmeYuzde: genFab.enCekmeYuzde,
            boyCekmeYuzde: genFab.boyCekmeYuzde,
          }
        }
        
        // Bu slot başka bir kumaş türüne ait — mevcut veriyi koru
        return existFab || genFab
      })

      cekmePromise = updateFoy(existingCekme.id, {
        ...existingCekme,
        sezon: savedSheet.sezon,
        etiket: savedSheet.etiket || existingCekme.etiket,
        modelKodu: savedSheet.baglandigiModel || existingCekme.modelKodu,
        sapKodu: savedSheet.sapKodu || existingCekme.sapKodu,
        kumasKodu: savedSheet.kumasKodu || existingCekme.kumasKodu,
        fabrics: mergedFabrics
      })
    } else {
      // İlk defa oluşturuluyorsa doğrudan ekle
      cekmeRecord.id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
      cekmePromise = addFoy(cekmeRecord)
    }

    // Hem Kumaş Takip hem de Çekme Tablosu güncellemelerini paralel yap (süreyi yarı yarıya indirir)
    const [serverRecord] = await Promise.all([savePromise, cekmePromise])

    if (serverRecord) {
      setSelectedSheet(serverRecord)
    } else {
      setSelectedSheet(savedSheet)
    }

    showNotification(existingCekme ? "Çekme tablosundaki bilgiler güncellenmiştir." : "Çekme tablosuna yeni föy kaydı eklendi.")
    return serverRecord
  }

  // Start a fresh form
  const handleNewSheet = () => {
    setSelectedSheet(null)
  }

  return (
    <div className="space-y-6 relative">
      {/* Şık Çekme Tablosu Güncellendi Bildirimi (Toast) */}
      {notification?.show && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 bg-neutral-900/95 text-white backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl border border-neutral-700/80 animate-in slide-in-from-top-3 fade-in duration-300">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex flex-col pr-1 text-left">
            <span className="text-xs font-bold text-neutral-100">Senkronizasyon Başarılı</span>
            <span className="text-xs text-neutral-300 font-medium">
              {notification.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors ml-2 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
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
            sheets={sheets}
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
