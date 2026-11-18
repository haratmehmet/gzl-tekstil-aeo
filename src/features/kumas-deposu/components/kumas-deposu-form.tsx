"use client"

import React, { useState } from "react"
import { useKumasDeposu, KumasDeposuRecord } from "../kumas-deposu-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, PlusCircle, Trash2 } from "lucide-react"

interface KumasDeposuFormProps {
  record?: KumasDeposuRecord | null
  isNew?: boolean
  onClose: () => void
}

export function KumasDeposuForm({ record: initialRecord, isNew = false, onClose }: KumasDeposuFormProps) {
  const { updateRecord, deleteRecord, addEmptyRecord, addManualRecord } = useKumasDeposu()

  const emptyRecord: KumasDeposuRecord = {
    id: "",
    tarih: new Date().toLocaleDateString('tr-TR'),
    renk: "",
    firma: "",
    sezon: "",
    kumasKodu: "",
    gelenMetraj: "",
    kesimTarihi: "",
    baglananModel: "",
    kesilenAdet: "",
    aciklama: "",
    harcananMetraj: "",
    netMetraj: "",
    takipFoyuId: null,
    parentId: null,
    eklenmeTarihi: new Date(),
    updatedAt: new Date(),
  }

  const [formData, setFormData] = useState<KumasDeposuRecord>(initialRecord || emptyRecord)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parseMetraj = (val: string) => {
    if (!val) return 0;
    let clean = val.replace(/[^0-9.,-]/g, '');
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    return parseFloat(clean) || 0;
  }

  const handleChange = (field: keyof KumasDeposuRecord, value: string) => {
    const updated = { ...formData, [field]: value }

    // Auto calculate net metraj if harcananMetraj changed or gelenMetraj changed
    if (field === "harcananMetraj" || field === "gelenMetraj") {
      if (!updated.gelenMetraj || updated.gelenMetraj.trim() === "") {
        updated.netMetraj = ""
      } else {
        const gelen = parseMetraj(updated.gelenMetraj)
        const harcanan = parseMetraj(updated.harcananMetraj || "")
        const net = Math.max(0, gelen - harcanan)
        const isKg = updated.gelenMetraj.toLowerCase().includes("kg")
        const unit = isKg ? "Kg" : "Mt"
        const netStr = Number.isInteger(net) ? net.toString() : net.toFixed(2).replace('.', ',')
        updated.netMetraj = `${netStr} ${unit}`
      }
    }

    setFormData(updated)
  }

  const handleSave = async (keepOpen = false) => {
    if (!formData.kumasKodu?.trim() && !formData.firma?.trim() && !formData.gelenMetraj?.trim()) {
      alert("Lütfen en azından Kumaş Kodu, Firma veya Gelen Metraj bilgisini giriniz.")
      return
    }

    setIsSubmitting(true)
    try {
      if (isNew) {
        const saved = await addManualRecord(formData)
        if (saved) {
          if (keepOpen) {
            setFormData({
              ...emptyRecord,
              tarih: formData.tarih,
              sezon: formData.sezon,
              firma: formData.firma
            })
            alert("Kayıt başarıyla eklendi! Sıradaki kumaşı girebilirsiniz.")
          } else {
            onClose()
          }
        } else {
          alert("Kayıt eklenirken bir hata oluştu.")
        }
      } else {
        await updateRecord(formData.id, formData)

        // Eğer daha önce harcanan metraj yoksa ve şimdi girildiyse, kalan net metrajı otomatik olarak yeni satıra (alta) devret
        const wasEmpty = !initialRecord?.harcananMetraj || parseFloat(initialRecord.harcananMetraj) === 0
        const isNowFilled = formData.harcananMetraj && parseMetraj(formData.harcananMetraj) > 0

        if (wasEmpty && isNowFilled) {
          addEmptyRecord(formData.id, formData)
        }

        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (confirm("Bu kayıt tamamen silinecek. Emin misiniz?")) {
      deleteRecord(formData.id)
      onClose()
    }
  }

  const handleAddSubRow = () => {
    // First save current changes
    updateRecord(formData.id, formData)
    // Then add new empty record linked to this one with latest form state overrides
    addEmptyRecord(formData.id, formData)
    onClose()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" onClick={onClose} className="allow-viewer" title="Geri / İptal">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-neutral-800">
              {isNew ? "Manuel Depo Kaydı Ekle" : "Depo Kaydı Düzenle"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isNew 
                ? "Sistem öncesi var olan veya harici kumaş depo stok bilgisi girişi" 
                : "Depodaki kumaşın kesim ve metraj güncellemesi"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!isNew && (
            <Button type="button" variant="destructive" size="icon" onClick={handleDelete} title="Kaydı Sil">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {isNew && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSave(true)} 
              disabled={isSubmitting}
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium text-xs"
            >
              <PlusCircle className="h-4 w-4" />
              Kaydet ve Yeni Ekle
            </Button>
          )}
          <Button 
            onClick={() => handleSave(false)} 
            disabled={isSubmitting}
            className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      {/* YELLOW HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden print:border-none print:shadow-none mb-2">
        <div className="grid grid-cols-4 border-b border-neutral-300">
          <div className="col-span-1 bg-yellow-400 font-extrabold text-neutral-900 border-r border-neutral-300 px-4 py-3 flex items-center justify-center text-xs tracking-wider uppercase text-center print:text-[10px]">
            GZL TEKSTİL
          </div>
          <div className="col-span-3 bg-yellow-300 font-black text-neutral-900 px-4 py-3 flex items-center justify-center text-sm tracking-widest uppercase text-center print:text-xs">
            KUMAŞ DEPOSU {isNew ? "- MANUEL GİRİŞ" : ""}
          </div>
        </div>
      </div>

      <Card className="border-neutral-200 bg-white overflow-hidden shadow-xl">
        <CardContent className="p-6 space-y-8">
          {/* MAVİ BÖLÜM - KUMAŞ VE DEPO BİLGİLERİ */}
          <div>
            <h3 className="text-sm font-bold text-sky-800 mb-4 uppercase flex items-center gap-2 border-b border-sky-100 pb-2">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              {isNew ? "Kumaş ve Stok Bilgileri" : "Otomatik Takip Föyü Bilgileri"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Tarih</Label>
                <Input 
                  value={formData.tarih} 
                  onChange={e => handleChange("tarih", e.target.value)} 
                  placeholder="Örn: 18.11.2026"
                  className="bg-sky-50/30 border-sky-100" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Renk</Label>
                <Input 
                  value={formData.renk} 
                  onChange={e => handleChange("renk", e.target.value.toUpperCase())} 
                  placeholder="Örn: SİYAH, EKRU"
                  className="bg-sky-50/30 border-sky-100 uppercase" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Firma</Label>
                <Input 
                  value={formData.firma} 
                  onChange={e => handleChange("firma", e.target.value.toUpperCase())} 
                  placeholder="Örn: İPEKER, YÜNSA"
                  className="bg-sky-50/30 border-sky-100 uppercase" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Sezon</Label>
                <Input 
                  value={formData.sezon} 
                  onChange={e => handleChange("sezon", e.target.value.toUpperCase())} 
                  placeholder="Örn: 25-26 FW"
                  className="bg-sky-50/30 border-sky-100 uppercase" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Kumaş Kodu</Label>
                <Input 
                  value={formData.kumasKodu} 
                  onChange={e => handleChange("kumasKodu", e.target.value.toUpperCase())} 
                  placeholder="Örn: 10245-A"
                  className="bg-sky-50/30 border-sky-100 uppercase font-semibold" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-sky-700">Gelen Metraj</Label>
                <Input 
                  value={formData.gelenMetraj} 
                  onChange={e => handleChange("gelenMetraj", e.target.value)} 
                  placeholder="Örn: 250 Mt veya 50 Kg"
                  className="bg-sky-100/50 border-sky-200 font-bold" 
                />
              </div>
            </div>
          </div>

          {/* TURUNCU BÖLÜM - KESİM İŞLEMLERİ */}
          <div>
            <h3 className="text-sm font-bold text-orange-800 mb-4 uppercase flex items-center gap-2 border-b border-orange-100 pb-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              Kesim ve İşlem Bilgileri {isNew ? "(Opsiyonel)" : ""}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Kesim Tarihi</Label>
                <Input 
                  type="date" 
                  value={formData.kesimTarihi || ""} 
                  onChange={e => handleChange("kesimTarihi", e.target.value)} 
                  className="bg-orange-50/30 border-orange-100" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Bağlanan Model</Label>
                <Input 
                  value={formData.baglananModel || ""} 
                  onChange={e => handleChange("baglananModel", e.target.value.toUpperCase())} 
                  placeholder="Örn: MD-204"
                  className="bg-orange-50/30 border-orange-100 uppercase" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Kesilen Adet</Label>
                <Input 
                  value={formData.kesilenAdet || ""} 
                  onChange={e => handleChange("kesilenAdet", e.target.value)} 
                  placeholder="Örn: 150"
                  className="bg-orange-50/30 border-orange-100" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-red-600">Harcanan Metraj</Label>
                <Input 
                  value={formData.harcananMetraj || ""} 
                  onChange={e => handleChange("harcananMetraj", e.target.value)} 
                  placeholder="Örn: 185 Mt" 
                  className="bg-orange-100 border-orange-200 text-red-600 font-black placeholder:font-normal placeholder:text-neutral-400" 
                />
              </div>
              <div className="col-span-2 md:col-span-4 space-y-1">
                <Label className="text-xs font-semibold text-neutral-600">Açıklama</Label>
                <Input 
                  value={formData.aciklama || ""} 
                  onChange={e => handleChange("aciklama", e.target.value)} 
                  placeholder="İsteğe bağlı not veya açıklama..."
                  className="bg-orange-50/30 border-orange-100" 
                />
              </div>
            </div>
          </div>

          {/* SARI BÖLÜM - SONUÇ */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-black text-yellow-900 uppercase">Kalan Net Metraj</Label>
              <p className="text-xs text-yellow-700 mt-1">
                Gelen metrajdan harcanan düşüldükten sonra depoda kalan miktar (otomatik hesaplanır, dilerseniz elle düzenleyebilirsiniz).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                value={formData.netMetraj || ""} 
                onChange={e => setFormData({ ...formData, netMetraj: e.target.value })}
                placeholder="Örn: 250 Mt"
                className="text-lg md:text-xl font-black text-neutral-900 bg-white px-4 py-2 rounded-lg border-2 border-yellow-300 shadow-sm w-44 text-center" 
              />
            </div>
          </div>

          {/* YENİ KESİM BUTONU - Sadece kayıtlı satırlar için */}
          {!isNew && (
            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <Button onClick={handleAddSubRow} variant="outline" className="gap-2 text-sky-700 border-sky-200 hover:bg-sky-50 font-bold">
                <PlusCircle className="h-4 w-4" />
                Kalan Net Metrajı Yeni Satır Olarak Devret
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
