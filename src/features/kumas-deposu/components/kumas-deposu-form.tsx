"use client"

import React, { useState } from "react"
import { useKumasDeposu, KumasDeposuRecord } from "../kumas-deposu-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, PlusCircle, Trash2 } from "lucide-react"

interface KumasDeposuFormProps {
  record: KumasDeposuRecord
  onClose: () => void
}

export function KumasDeposuForm({ record: initialRecord, onClose }: KumasDeposuFormProps) {
  const { updateRecord, deleteRecord, addEmptyRecord } = useKumasDeposu()
  const [formData, setFormData] = useState<KumasDeposuRecord>(initialRecord)

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

    // Auto calculate net metraj if harcananMetraj changed
    if (field === "harcananMetraj" || field === "gelenMetraj") {
      const gelen = parseMetraj(updated.gelenMetraj)
      const harcanan = parseMetraj(updated.harcananMetraj || "")
      const net = gelen - harcanan
      const isKg = updated.gelenMetraj.toLowerCase().includes("kg")
      updated.netMetraj = `${net.toFixed(2).replace('.', ',')} ${isKg ? "Kg" : "Mt"}`
    }

    setFormData(updated)
  }

  const handleSave = () => {
    updateRecord(formData.id, formData)
    onClose()
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
    // Then add new empty record linked to this one
    addEmptyRecord(formData.id)
    onClose()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-neutral-800">
              Depo Kaydı Düzenle
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="destructive" size="icon" onClick={handleDelete} title="Kaydı Sil">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white">
            <Save className="h-4 w-4" />
            Kaydet
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
            KUMAŞ DEPOSU
          </div>
        </div>
      </div>

    <Card className="border-neutral-200 bg-white overflow-hidden shadow-xl">

      <CardContent className="p-6 space-y-8">
        {/* MAVİ BÖLÜM - TAKİP FÖYÜ BİLGİLERİ */}
        <div>
          <h3 className="text-sm font-bold text-sky-800 mb-4 uppercase flex items-center gap-2 border-b border-sky-100 pb-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            Otomatik Takip Föyü Bilgileri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Tarih</Label>
              <Input value={formData.tarih} onChange={e => handleChange("tarih", e.target.value)} className="bg-sky-50/30 border-sky-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Renk</Label>
              <Input value={formData.renk} onChange={e => handleChange("renk", e.target.value.toUpperCase())} className="bg-sky-50/30 border-sky-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Firma</Label>
              <Input value={formData.firma} onChange={e => handleChange("firma", e.target.value.toUpperCase())} className="bg-sky-50/30 border-sky-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Sezon</Label>
              <Input value={formData.sezon} onChange={e => handleChange("sezon", e.target.value.toUpperCase())} className="bg-sky-50/30 border-sky-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Kumaş Kodu</Label>
              <Input value={formData.kumasKodu} onChange={e => handleChange("kumasKodu", e.target.value.toUpperCase())} className="bg-sky-50/30 border-sky-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-sky-700">Gelen Metraj</Label>
              <Input value={formData.gelenMetraj} onChange={e => handleChange("gelenMetraj", e.target.value)} className="bg-sky-100/50 border-sky-200 font-bold" />
            </div>
          </div>
        </div>

        {/* TURUNCU BÖLÜM - KESİM İŞLEMLERİ */}
        <div>
          <h3 className="text-sm font-bold text-orange-800 mb-4 uppercase flex items-center gap-2 border-b border-orange-100 pb-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            Kesim ve Manuel İşlemler
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Kesim Tarihi</Label>
              <Input type="date" value={formData.kesimTarihi || ""} onChange={e => handleChange("kesimTarihi", e.target.value)} className="bg-orange-50/30 border-orange-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Bağlanan Model</Label>
              <Input value={formData.baglananModel || ""} onChange={e => handleChange("baglananModel", e.target.value.toUpperCase())} className="bg-orange-50/30 border-orange-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Kesilen Adet</Label>
              <Input value={formData.kesilenAdet || ""} onChange={e => handleChange("kesilenAdet", e.target.value)} className="bg-orange-50/30 border-orange-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-red-600">Harcanan Metraj</Label>
              <Input value={formData.harcananMetraj || ""} onChange={e => handleChange("harcananMetraj", e.target.value)} placeholder="Örn: 185 mt" className="bg-orange-100 border-orange-200 text-red-600 font-black placeholder:font-normal placeholder:text-neutral-400" />
            </div>
            <div className="col-span-2 md:col-span-4 space-y-1">
              <Label className="text-xs font-semibold text-neutral-600">Açıklama</Label>
              <Input value={formData.aciklama || ""} onChange={e => handleChange("aciklama", e.target.value)} className="bg-orange-50/30 border-orange-100" />
            </div>
          </div>
        </div>

        {/* SARI BÖLÜM - SONUÇ */}
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex items-center justify-between">
          <div>
            <Label className="text-sm font-black text-yellow-900 uppercase">Kalan Net Metraj</Label>
            <p className="text-xs text-yellow-700 mt-1">Gelen metrajdan harcanan düşüldükten sonra kalan otomatik miktar.</p>
          </div>
          <div className="text-2xl font-black text-neutral-900 bg-white px-6 py-2 rounded-lg border-2 border-yellow-300 shadow-sm">
            {formData.netMetraj}
          </div>
        </div>

        {/* YENİ KESİM BUTONU */}
        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <Button onClick={handleAddSubRow} variant="outline" className="gap-2 text-sky-700 border-sky-200 hover:bg-sky-50 font-bold">
            <PlusCircle className="h-4 w-4" />
            Kalan Net Metrajı Yeni Satır Olarak Devret
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
