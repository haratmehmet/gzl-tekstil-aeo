"use client"

import * as React from "react"
import { CekmeFoyu, CekmeKumasDetay } from "../types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Plus, Trash2, ArrowLeft, RefreshCw } from "lucide-react"
import { useKumasTakipStore, KumasTakipSheet } from "@/features/kumas-takip"

interface CekmeFormProps {
  initialData?: CekmeFoyu | null
  activeSezon: string
  onSave: (data: CekmeFoyu) => void
  onCancel: () => void
}

const emptyFabric: CekmeKumasDetay = {
  id: "",
  kullanildigiYer: "",
  kumasIcerik: "",
  tedarikci: "",
  artikelAdi: "",
  urunDptRenk: "",
  gelenMetraj: "",
  kumasEn: "",
  enCekmeYuzde: "",
  boyCekmeYuzde: ""
}

export function CekmeForm({ initialData, activeSezon, onSave, onCancel }: CekmeFormProps) {
  const { sheets: takipSheets } = useKumasTakipStore()
  const activeTakipSheets = React.useMemo(() => takipSheets.filter(s => s.sezon === activeSezon), [takipSheets, activeSezon])

  const [formData, setFormData] = React.useState<Partial<CekmeFoyu>>({
    testeGonderilmeTarihi: "",
    modelist: "",
    etiket: "",
    modelKodu: "",
    sapKodu: "",
    kumasKodu: "",
    fabrics: [{ ...emptyFabric, id: Date.now().toString() }],
    sezon: activeSezon,
    ...initialData
  })

  const handleAutoFill = (takipId: string) => {
    if (!takipId) return
    const sheet = takipSheets.find(s => s.id === takipId)
    if (!sheet) return

    setFormData(prev => ({
      ...prev,
      testeGonderilmeTarihi: sheet.geldigiTarih || "",
      modelKodu: sheet.baglandigiModel || "",
      sapKodu: sheet.sapKodu || "",
      kumasKodu: sheet.kumasKodu || "",
      fabrics: [
        {
          id: Date.now().toString(),
          kullanildigiYer: sheet.kullanildigiYer || "",
          kumasIcerik: sheet.kumasIcerik || "",
          tedarikci: sheet.kumasciFirma || "",
          artikelAdi: prev.fabrics?.[0]?.artikelAdi || "", // preserve if already filled
          urunDptRenk: sheet.kumasRenk || "",
          gelenMetraj: sheet.gelenMetraj || "",
          kumasEn: sheet.kumasEn || "",
          enCekmeYuzde: sheet.cekmeEn || "",
          boyCekmeYuzde: sheet.cekmeBoy || "",
        },
        ...(prev.fabrics?.slice(1) || []) // preserve other fabrics if any
      ]
    }))
  }

  const handleInputChange = (field: keyof CekmeFoyu, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFabricChange = (index: number, field: keyof CekmeKumasDetay, value: string) => {
    setFormData((prev) => {
      const updatedFabrics = [...(prev.fabrics || [])]
      updatedFabrics[index] = { ...updatedFabrics[index], [field]: value }
      return { ...prev, fabrics: updatedFabrics }
    })
  }

  const addFabric = () => {
    if ((formData.fabrics?.length || 0) >= 3) return // Max 3 fabrics according to UI plan
    setFormData((prev) => ({
      ...prev,
      fabrics: [...(prev.fabrics || []), { ...emptyFabric, id: Date.now().toString() }]
    }))
  }

  const removeFabric = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fabrics: (prev.fabrics || []).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalData: CekmeFoyu = {
      id: formData.id || Date.now().toString(),
      sezon: formData.sezon || activeSezon,
      testeGonderilmeTarihi: formData.testeGonderilmeTarihi || "",
      modelist: formData.modelist || "",
      etiket: formData.etiket || "",
      modelKodu: formData.modelKodu || "",
      sapKodu: formData.sapKodu || "",
      kumasKodu: formData.kumasKodu || "",
      fabrics: formData.fabrics || [],
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    onSave(finalData)
  }

  const fabricColors = [
    "border-fuchsia-200 bg-fuchsia-50/30",
    "border-orange-200 bg-orange-50/30",
    "border-green-200 bg-green-50/30"
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-neutral-800">
              {initialData ? "Föyü Düzenle" : "Yeni Çekme Föyü Ekle"}
            </h2>
            <p className="text-xs text-neutral-500">Sezon: {activeSezon}</p>
          </div>
        </div>
        <Button type="submit" className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white">
          <Save className="h-4 w-4" />
          Kaydet
        </Button>
      </div>

      {/* YELLOW HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden print:border-none print:shadow-none mb-2">
        <div className="grid grid-cols-4 border-b border-neutral-300">
          <div className="col-span-1 bg-yellow-400 font-extrabold text-neutral-900 border-r border-neutral-300 px-4 py-3 flex items-center justify-center text-xs tracking-wider uppercase text-center print:text-[10px]">
            GZL TEKSTİL
          </div>
          <div className="col-span-3 bg-yellow-300 font-black text-neutral-900 px-4 py-3 flex items-center justify-center text-sm tracking-widest uppercase text-center print:text-xs">
            ÇEKME TABLOSU
          </div>
        </div>
      </div>

      {!initialData && activeTakipSheets.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <Label className="text-xs font-bold text-blue-800">Kumaş Takip Föyünden Otomatik Doldur</Label>
              <select 
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => handleAutoFill(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Takip föyü seçin...</option>
                {activeTakipSheets.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.kumasKodu} - {s.kumasciFirma} ({s.baglandigiModel || "Model Yok"})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-neutral-200 shadow-sm bg-white">
        <CardHeader className="pb-4 border-b border-neutral-100">
          <CardTitle className="text-sm font-bold text-neutral-800">Genel Bilgiler</CardTitle>
          <CardDescription className="text-xs">Model ve kumaş kodu gibi temel tanımlamalar.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-500 uppercase">Gön. Tarihi</Label>
            <Input type="date" value={formData.testeGonderilmeTarihi} onChange={(e) => handleInputChange("testeGonderilmeTarihi", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-500 uppercase">Modelist</Label>
            <Input value={formData.modelist} onChange={(e) => handleInputChange("modelist", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-500 uppercase">Etiket</Label>
            <select
              value={formData.etiket}
              onChange={(e) => handleInputChange("etiket", e.target.value)}
              className="w-full h-9 px-3 text-xs text-center rounded-md border border-neutral-200 bg-white font-semibold text-neutral-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              <option value="">Seçiniz...</option>
              <option value="Academia">Academia</option>
              <option value="Beymen Collection">Beymen Collection</option>
              <option value="Beymen Club">Beymen Club</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-500 uppercase">Model Kodu</Label>
            <Input value={formData.modelKodu} onChange={(e) => handleInputChange("modelKodu", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-500 uppercase">SAP Kodu</Label>
            <Input value={formData.sapKodu} onChange={(e) => handleInputChange("sapKodu", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-500 uppercase text-blue-600">Kumaş Kodu</Label>
            <Input value={formData.kumasKodu} onChange={(e) => handleInputChange("kumasKodu", e.target.value)} className="h-9 text-xs border-blue-200 focus-visible:ring-blue-400 bg-blue-50/30" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {formData.fabrics?.map((fabric, index) => (
          <Card key={fabric.id || index} className={`border ${fabricColors[index % 3]}`}>
            <CardHeader className="py-3 px-4 border-b border-black/5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-neutral-800">
                {index + 1}. Kumaş Bloğu
              </CardTitle>
              {index > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFabric(index)} className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" /> Sil
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Kullanıldığı Yer</Label>
                <Input value={fabric.kullanildigiYer} onChange={(e) => handleFabricChange(index, "kullanildigiYer", e.target.value)} className="h-8 text-xs bg-white" placeholder="Örn: Ana Kumaş" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Kumaş İçerik</Label>
                <Input value={fabric.kumasIcerik} onChange={(e) => handleFabricChange(index, "kumasIcerik", e.target.value.toUpperCase())} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Tedarikçi</Label>
                <Input value={fabric.tedarikci} onChange={(e) => handleFabricChange(index, "tedarikci", e.target.value)} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Artikel Adı</Label>
                <Input value={fabric.artikelAdi} onChange={(e) => handleFabricChange(index, "artikelAdi", e.target.value)} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Ürün Dpt Renk</Label>
                <Input value={fabric.urunDptRenk} onChange={(e) => handleFabricChange(index, "urunDptRenk", e.target.value.toUpperCase())} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Gelen Metraj</Label>
                <Input type="number" value={fabric.gelenMetraj} onChange={(e) => handleFabricChange(index, "gelenMetraj", e.target.value)} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Kumaş En</Label>
                <Input type="number" value={fabric.kumasEn} onChange={(e) => handleFabricChange(index, "kumasEn", e.target.value)} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">En Çekme %</Label>
                <Input type="number" value={fabric.enCekmeYuzde} onChange={(e) => handleFabricChange(index, "enCekmeYuzde", e.target.value)} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-neutral-500 uppercase">Boy Çekme %</Label>
                <Input type="number" value={fabric.boyCekmeYuzde} onChange={(e) => handleFabricChange(index, "boyCekmeYuzde", e.target.value)} className="h-8 text-xs bg-white" />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(formData.fabrics?.length || 0) < 3 && (
          <Button type="button" variant="outline" onClick={addFabric} className="w-full border-dashed border-neutral-300 text-neutral-500 bg-neutral-50 hover:bg-neutral-100 h-12">
            <Plus className="h-4 w-4 mr-2" /> Yeni Kumaş Bloğu Ekle (Maks. 3)
          </Button>
        )}
      </div>
    </form>
  )
}
