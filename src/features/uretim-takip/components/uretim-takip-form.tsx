"use client"

import React from "react"
import { Plus, Minus, Trash2 } from "lucide-react"
import { UretimTakipRecord, UretimTakipBeden } from "../uretim-takip-store"

interface Props {
  data: UretimTakipRecord
  onChange: (data: UretimTakipRecord) => void
}

export function UretimTakipForm({ data, onChange }: Props) {
  const set = (field: keyof UretimTakipRecord, value: any) => onChange({ ...data, [field]: value })

  const setBeden = (index: number, field: string, val: string) => {
    const newB = [...data.bedenler]
    newB[index] = { ...newB[index], [field as keyof UretimTakipBeden]: val }
    set("bedenler", newB)
  }

  const addBeden = () => {
    const newB = [...data.bedenler, { beden: "", bedenAdi: "", kesilenAdet: "", ikiKaliteAdet: "", netAdet: "" }]
    set("bedenler", newB)
  }

  const removeBeden = (index: number) => {
    const newB = data.bedenler.filter((_, i) => i !== index)
    set("bedenler", newB)
  }

  const handleDate = (field: keyof UretimTakipRecord) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8)
    let f = digits
    if (digits.length > 2 && digits.length <= 4) f = `${digits.slice(0, 2)}/${digits.slice(2)}`
    else if (digits.length > 4) f = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    set(field, f)
  }


  const toplamKesilen = data.bedenler.reduce((s, b) => s + (parseFloat(b.kesilenAdet) || 0), 0)
  const toplam2Kalite = data.bedenler.reduce((s, b) => s + (parseFloat(b.ikiKaliteAdet) || 0), 0)
  const toplamNet = data.bedenler.reduce((s, b) => s + (parseFloat(b.netAdet) || 0), 0)

  // Ortak stiller
  const cellLabel = "text-[10px] font-bold text-neutral-700 text-center leading-tight px-1 py-1 bg-neutral-100 border-b border-neutral-500"
  const cellInput = "w-full px-2 py-2 text-[11px] text-neutral-800 text-center focus:outline-none bg-transparent"
  const cell = "border-r border-neutral-500 last:border-r-0"

  return (
    <>
      <div className="flex flex-col bg-neutral-100 p-4 md:p-8 items-center print:p-2 print:bg-white">

        <div
          className="hidden lg:block print:block w-full max-w-[720px] print:max-w-none bg-white text-neutral-800"
          style={{ border: "2px solid #404040", fontSize: 11 }}
          id="uretim-takip-print-area"
        >

          {/* SARI BAŞLIK */}
          <div style={{ display: "flex", borderBottom: "2px solid #404040" }}>
            <div style={{ width: "25%", background: "#facc15", borderRight: "2px solid #404040", padding: "8px 4px", fontWeight: 900, fontSize: 10, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 1 }}>
              GZL TEKSTİL
            </div>
            <div style={{ flex: 1, background: "#fde047", padding: "8px 4px", fontWeight: 900, fontSize: 13, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 2 }}>
              ÜRÜN TAKİP FÖYÜ
            </div>
          </div>

          {/* ÜST BİLGİLER - 3 sütun */}
          {[
            [
              { label: "MODEL KODU", field: "modelKodu" as const },
              { label: "SEZON", field: "sezon" as const },
              { label: "ETİKET", field: "etiket" as const },
            ],
            [
              { label: "SAP KODU", field: "sapKodu" as const, maxLength: 9 },
              { label: "KUMAŞ KODU", field: "kumasKodu" as const },
              { label: "KUMAŞ İÇERİK", field: "kumasIcerik" as const },
            ],
            [
              { label: "KESİM TARİHİ", field: "kesimTarihi" as const, isDate: true },
              { label: "DİKİM BAŞLANGIÇ TARİHİ", field: "dikimBaslangicTarihi" as const, isDate: true },
              { label: "PAKETLEME/BİTİM TARİHİ", field: "paketlemeTarihi" as const, isDate: true },
            ],
          ].map((row, ri) => (
            <div key={ri} style={{ display: "flex", borderBottom: ri === 2 ? "2px solid #404040" : "1px solid #737373" }}>
              {row.map((col, ci) => (
                <div key={ci} style={{ flex: 1, borderRight: ci < 2 ? "1px solid #737373" : "none" }}>
                  <div style={{ background: "#f3f4f6", padding: "4px 6px", fontWeight: 700, fontSize: 10, textAlign: "center", borderBottom: "1px solid #737373", minHeight: 22, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1.2 }}>
                    {col.label}
                  </div>
                  <input
                    value={data[col.field] as string}
                    maxLength={(col as any).maxLength}
                    placeholder={(col as any).isDate ? "GG/AA/YYYY" : ""}
                    onChange={(col as any).isDate ? handleDate(col.field) : e => set(col.field, e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 11, textAlign: "center", color: "#1f2937", background: "transparent", border: "none", outline: "none", display: "block", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
          ))}

          {/* BEDEN TABLOSU */}
          <div style={{ background: "#f0f9ff" }}>
            {/* Başlık */}
            <div style={{ display: "flex", borderBottom: "1px solid #737373" }}>
              {[
                { label: "BEDEN", bg: "#bae6fd", flex: 1 },
                { label: "KESİLEN ADET", bg: "#bae6fd", flex: 1 },
                { label: "2.KALİTE ADET", bg: "#bbf7d0", flex: 1 },
                { label: "NET ADET", bg: "#bae6fd", flex: 1 },
              ].map((col, i) => (
                <div key={i} style={{ flex: col.flex, background: col.bg, padding: "6px 4px", fontWeight: 700, fontSize: 10, textAlign: "center", borderRight: i < 3 ? "1px solid #737373" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {col.label}
                </div>
              ))}
            </div>

            {/* Beden satırları */}
            {data.bedenler.length === 0 && (
              <div className="p-4 flex items-center justify-center border-b border-neutral-400">
                <button type="button" onClick={addBeden} className="text-emerald-600 bg-emerald-100 hover:bg-emerald-200 rounded-full px-4 py-2 font-black text-xs print:hidden shadow-sm flex items-center gap-2 border border-emerald-200 transition-colors">
                  <Plus className="w-4 h-4 stroke-[3]" /> BEDEN EKLE
                </button>
              </div>
            )}
            {data.bedenler.map((b, i) => (
              <div key={i} className="group relative" style={{ display: "flex", borderBottom: i === data.bedenler.length - 1 ? "2px solid #404040" : "1px solid #d4d4d4" }}>
                <div className="absolute -left-12 top-0 bottom-0 flex items-center justify-center gap-1 print:hidden">
                  <button type="button" onClick={() => removeBeden(i)} className="text-red-500 bg-red-100 hover:bg-red-200 hover:text-red-600 rounded-full shadow-sm w-5 h-5 flex items-center justify-center transition-colors border border-red-200" title="Beden Sil">
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  {i === data.bedenler.length - 1 && (
                    <button type="button" onClick={addBeden} className="text-emerald-600 bg-emerald-100 hover:bg-emerald-200 hover:text-emerald-700 rounded-full shadow-sm w-5 h-5 flex items-center justify-center transition-colors border border-emerald-200" title="Beden Ekle">
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  )}
                </div>

                <div style={{ flex: 1, background: "#e0f2fe", borderRight: "1px solid #737373", display: "flex", alignItems: "stretch" }}>
                  <div style={{ width: "45%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <input value={b.beden} onChange={e => setBeden(i, "beden", e.target.value)}
                      style={{ width: "100%", padding: "5px 2px", fontWeight: 900, fontSize: 11, textAlign: "center", color: "#0c4a6e", background: "transparent", border: "none", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ width: "10%", display: "flex", alignItems: "center", justifyContent: "center", color: "#7dd3fc", fontWeight: 900, fontSize: 14 }}>
                    /
                  </div>
                  <div style={{ width: "45%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <input value={b.bedenAdi} onChange={e => setBeden(i, "bedenAdi", e.target.value)}
                      style={{ width: "100%", padding: "5px 2px", fontWeight: 600, fontSize: 11, textAlign: "center", color: "#4b5563", background: "transparent", border: "none", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ flex: 1, borderRight: "1px solid #737373" }}>
                  <input value={b.kesilenAdet} onChange={e => setBeden(i, "kesilenAdet", e.target.value)}
                    style={{ width: "100%", padding: "5px 8px", fontSize: 11, textAlign: "center", color: "#1f2937", background: "transparent", border: "none", outline: "none", display: "block", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, background: "#f0fdf4", borderRight: "1px solid #737373" }}>
                  <input value={b.ikiKaliteAdet} onChange={e => setBeden(i, "ikiKaliteAdet", e.target.value)}
                    style={{ width: "100%", padding: "5px 8px", fontSize: 11, textAlign: "center", color: "#1f2937", background: "transparent", border: "none", outline: "none", display: "block", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <input value={b.netAdet} onChange={e => setBeden(i, "netAdet", e.target.value)}
                    style={{ width: "100%", padding: "5px 8px", fontSize: 11, textAlign: "center", color: "#1f2937", background: "transparent", border: "none", outline: "none", display: "block", boxSizing: "border-box" }} />
                </div>
              </div>
            ))}

            {/* Toplamlar */}
            {[
              { label: "TOPLAM KESİLEN ADET:", val: toplamKesilen },
              { label: "TOPLAM 2.KALİTE ADET:", val: toplam2Kalite },
              { label: "TOPLAM NET ADET:", val: toplamNet },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", borderBottom: i < 2 ? "1px solid #737373" : "2px solid #404040" }}>
                <div style={{ flex: 2, background: "#bae6fd", borderRight: "1px solid #737373", padding: "6px 10px", fontWeight: 700, fontSize: 10, display: "flex", alignItems: "center" }}>
                  {row.label}
                </div>
                <div style={{ flex: 2, padding: "6px", fontWeight: 900, fontSize: 12, textAlign: "center", color: "#0c4a6e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {row.val || ""}
                </div>
              </div>
            ))}
          </div>

          {/* ALT BÖLÜM - Pembe */}
          {[
            { label: "KESİLEN METRAJ", field: "kesilenMetraj" as const },
            { label: "ETİKET", field: "etiketBilgi" as const },
            { label: "NUMARA", field: "numara" as const },
            { label: "BARKOD/TALİMAT", field: "barkodTalimat" as const },
            { label: "FİYAT STICKER", field: "fiyatSticker" as const },
            { label: "K/K DURUMU", field: "kkDurumu" as const },
            { label: "SEVK DURUMU", field: "sevkDurumu" as const },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: "flex", borderBottom: i < arr.length - 1 ? "1px solid #737373" : "2px solid #404040" }}>
              <div style={{ flex: 1, background: "#ffe4e6", borderRight: "1px solid #737373", padding: "6px 10px", fontWeight: 700, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                {row.label}
              </div>
              <div style={{ flex: 1, background: "#fff1f2" }}>
                <input value={data[row.field] as string} onChange={e => set(row.field, e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: 11, textAlign: "center", color: "#1f2937", background: "transparent", border: "none", outline: "none", display: "block", boxSizing: "border-box" }} />
              </div>
            </div>
          ))}

          {/* NOT/KRİTİK */}
          <div style={{ background: "#f0f9ff", position: "relative", minHeight: 90 }}>
            <div style={{ position: "absolute", top: 8, left: 10, fontWeight: 900, color: "#dc2626", textDecoration: "underline", fontSize: 11 }}>NOT/KRİTİK</div>
            <textarea
              value={data.notKritik}
              onChange={e => set("notKritik", e.target.value)}
              style={{ width: "100%", minHeight: 90, paddingTop: 28, paddingLeft: 10, paddingRight: 10, paddingBottom: 8, fontSize: 11, color: "#1f2937", background: "transparent", border: "none", outline: "none", resize: "none", display: "block", boxSizing: "border-box" }}
            />
          </div>

        </div>

        {/* ==============================
            MOBİL GÖRÜNÜM (Kart Yapısı)
            ============================== */}
        <div className="block lg:hidden print:hidden w-full max-w-lg mx-auto space-y-4">
          
          <div className="bg-yellow-400 p-3 rounded-t-2xl shadow-sm text-center border-2 border-neutral-800">
            <h2 className="text-sm font-black text-neutral-900 tracking-widest">GZL TEKSTİL</h2>
            <h1 className="text-xl font-black text-neutral-900 tracking-wide mt-1">ÜRÜN TAKİP</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
            {[
              { label: "Model Kodu", field: "modelKodu", ph: "Örn: ME777" },
              { label: "Sezon", field: "sezon", ph: "Örn: SS26" },
              { label: "Etiket", field: "etiket", ph: "Etiket bilgisi" },
              { label: "SAP Kodu", field: "sapKodu", ph: "123456789", max: 9 },
              { label: "Kumaş Kodu", field: "kumasKodu", ph: "Örn: KM123" },
              { label: "Kumaş İçerik", field: "kumasIcerik", ph: "%100 Pamuk" },
              { label: "Kesim Tarihi", field: "kesimTarihi", isDate: true },
              { label: "Dikim Başlangıç", field: "dikimBaslangicTarihi", isDate: true },
              { label: "Paketleme/Bitim", field: "paketlemeTarihi", isDate: true },
            ].map((col, i) => (
              <div key={i} className="flex items-center p-3">
                <span className="w-1/3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{col.label}</span>
                <div className="w-2/3">
                  <input
                    value={data[col.field as keyof UretimTakipRecord] as string}
                    onChange={col.isDate ? handleDate(col.field as keyof UretimTakipRecord) : e => set(col.field as keyof UretimTakipRecord, e.target.value)}
                    maxLength={col.max}
                    placeholder={col.isDate ? "GG/AA/YYYY" : col.ph}
                    className="w-full text-sm font-semibold text-neutral-900 focus:outline-none bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200 focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-2 pt-2">
            <h3 className="text-sm font-black text-sky-900 uppercase tracking-wider">Bedenler</h3>
            <button type="button" onClick={addBeden} className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-2 py-1 rounded-md border border-sky-200 transition-colors">
              + Beden Ekle
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {data.bedenler.map((b, i) => (
              <div key={i} className="bg-sky-50 border border-sky-100 rounded-xl p-3 shadow-sm relative">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-200/50">
                  <div className="flex items-center gap-1">
                    <input value={b.beden} onChange={e => setBeden(i, "beden", e.target.value)} 
                      className="text-lg font-black text-sky-900 bg-transparent focus:outline-none focus:bg-sky-100 rounded w-12 text-center" placeholder="34" />
                    <span className="text-sky-300 font-black text-lg">/</span>
                    <input value={b.bedenAdi} onChange={e => setBeden(i, "bedenAdi", e.target.value)} 
                      className="text-xs font-semibold text-sky-700 bg-transparent focus:outline-none focus:bg-sky-100 rounded w-16 text-center" placeholder="XS" />
                  </div>
                  <button type="button" onClick={() => removeBeden(i)} className="text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors shadow-sm ml-2 print:hidden" title="SİL">
                    <Trash2 className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-sky-100 text-center shadow-sm">
                    <label className="block text-[10px] font-bold text-sky-600 mb-1">KESİLEN</label>
                    <input value={b.kesilenAdet} onChange={e => setBeden(i, "kesilenAdet", e.target.value)} type="number"
                      className="w-full text-center text-sm font-black text-neutral-800 bg-transparent focus:outline-none" placeholder="0" />
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg border border-green-100 text-center shadow-sm">
                    <label className="block text-[10px] font-bold text-green-700 mb-1">2.KALİTE</label>
                    <input value={b.ikiKaliteAdet} onChange={e => setBeden(i, "ikiKaliteAdet", e.target.value)} type="number"
                      className="w-full text-center text-sm font-black text-neutral-800 bg-transparent focus:outline-none" placeholder="0" />
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-sky-100 text-center shadow-sm">
                    <label className="block text-[10px] font-bold text-sky-600 mb-1">NET ADET</label>
                    <input value={b.netAdet} onChange={e => setBeden(i, "netAdet", e.target.value)} type="number"
                      className="w-full text-center text-sm font-black text-neutral-800 bg-transparent focus:outline-none" placeholder="0" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Toplam Kartı */}
          <div className="bg-white border-2 border-neutral-800 rounded-xl p-3 shadow-sm flex justify-between divide-x divide-neutral-200">
            <div className="px-2 flex-1 text-center">
              <div className="text-[10px] font-bold text-neutral-500 mb-1">TOPLAM KESİLEN</div>
              <div className="text-lg font-black text-sky-700">{toplamKesilen}</div>
            </div>
            <div className="px-2 flex-1 text-center">
              <div className="text-[10px] font-bold text-neutral-500 mb-1">TOPLAM 2.KALİTE</div>
              <div className="text-lg font-black text-green-600">{toplam2Kalite}</div>
            </div>
            <div className="px-2 flex-1 text-center">
              <div className="text-[10px] font-bold text-neutral-500 mb-1">TOPLAM NET</div>
              <div className="text-lg font-black text-neutral-900">{toplamNet}</div>
            </div>
          </div>

          <h3 className="text-sm font-black text-rose-800 uppercase tracking-wider px-2 pt-2">Durum & Takip</h3>

          <div className="bg-rose-50 rounded-xl shadow-sm border border-rose-100 overflow-hidden divide-y divide-rose-100">
            {[
              { label: "Kesilen Metraj", field: "kesilenMetraj" },
              { label: "Etiket Bilgisi", field: "etiketBilgi" },
              { label: "Numara", field: "numara" },
              { label: "Barkod / Talimat", field: "barkodTalimat" },
              { label: "Fiyat Sticker", field: "fiyatSticker" },
              { label: "K/K Durumu", field: "kkDurumu" },
              { label: "Sevk Durumu", field: "sevkDurumu" },
            ].map((col, i) => (
              <div key={i} className="flex items-center p-3">
                <span className="w-1/3 text-[11px] font-bold text-rose-700 uppercase tracking-wider">{col.label}</span>
                <div className="w-2/3">
                  <input
                    value={data[col.field as keyof UretimTakipRecord] as string}
                    onChange={e => set(col.field as keyof UretimTakipRecord, e.target.value)}
                    className="w-full text-sm font-semibold text-neutral-900 focus:outline-none bg-white rounded-lg px-3 py-2 border border-rose-100 focus:border-rose-400 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Not Kritik */}
          <div className="bg-white border-2 border-red-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-red-50 p-2 border-b border-red-200">
              <span className="text-xs font-black text-red-600 uppercase tracking-widest ml-1">Not / Kritik</span>
            </div>
            <textarea
              value={data.notKritik}
              onChange={e => set("notKritik", e.target.value)}
              className="w-full p-3 min-h-[100px] text-sm text-neutral-800 focus:outline-none resize-y"
              placeholder="Eklemek istediğiniz notlar..."
            />
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
    </>
  )
}
