"use client"

import React from "react"
import { Plus, Minus, Trash2 } from "lucide-react"
import { KesimKontrolRecord } from "../kesim-kontrol-store"

interface FormProps {
  data: KesimKontrolRecord
  onChange: (data: KesimKontrolRecord) => void
}

export function KesimKontrolForm({ data, onChange }: FormProps) {

  const handleUpdate = (field: keyof KesimKontrolRecord, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const handleDateUpdate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    let formatted = digits
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    }
    handleUpdate("kesimTarihi", formatted)
  }

  const handleKumasUpdate = (index: number, field: string, value: string) => {
    const newKumaslar = [...data.kumaslar]
    newKumaslar[index] = { ...newKumaslar[index], [field]: value }
    handleUpdate("kumaslar", newKumaslar)
  }

  const addKumas = () => {
    const newKumaslar = [...data.kumaslar, { kodu: "", kullanimYeri: "", birimMetre: "", kumasciFirma: "" }]
    handleUpdate("kumaslar", newKumaslar)
  }

  const removeKumas = (index: number) => {
    const newKumaslar = data.kumaslar.filter((_, i) => i !== index)
    handleUpdate("kumaslar", newKumaslar)
  }

  const addBeden = () => {
    const newBedenler = [...data.bedenler.rows, { id: Math.random().toString(36).substring(7), kumasTuru: "", values: Object.fromEntries(data.bedenler.headers.map(h => [h, ""])), toplamAdet: "", kesilenMt: "" }]
    handleUpdate("bedenler", { ...data.bedenler, rows: newBedenler })
  }

  const removeBeden = (index: number) => {
    const newBedenler = data.bedenler.rows.filter((_, i) => i !== index)
    handleUpdate("bedenler", { ...data.bedenler, rows: newBedenler })
  }

  const handleBedenUpdate = (index: number, field: string, value: string) => {
    const newBedenler = [...data.bedenler.rows]
    newBedenler[index] = { ...newBedenler[index], [field]: value }
    handleUpdate("bedenler", { ...data.bedenler, rows: newBedenler })
  }

  const handleBedenValueUpdate = (index: number, header: string, value: string) => {
    const newBedenler = [...data.bedenler.rows]
    newBedenler[index] = { 
      ...newBedenler[index], 
      values: { ...newBedenler[index].values, [header]: value }
    }
    handleUpdate("bedenler", { ...data.bedenler, rows: newBedenler })
  }

  const handleHeaderUpdate = (headerIndex: number, newHeader: string) => {
    const oldHeader = data.bedenler.headers[headerIndex]
    const newHeaders = [...data.bedenler.headers]
    newHeaders[headerIndex] = newHeader
    
    const newRows = data.bedenler.rows.map(row => {
      const newValues = { ...row.values }
      const val = newValues[oldHeader]
      delete newValues[oldHeader]
      newValues[newHeader] = val || ""
      return { ...row, values: newValues }
    })
    
    handleUpdate("bedenler", { headers: newHeaders, rows: newRows })
  }

  const addHeader = () => {
    const newHeader = ` / `
    const newHeaders = [...data.bedenler.headers, newHeader]
    const newRows = data.bedenler.rows.map(row => ({
      ...row,
      values: { ...row.values, [newHeader]: "" }
    }))
    handleUpdate("bedenler", { headers: newHeaders, rows: newRows })
  }

  const removeHeader = (headerIndex: number) => {
    const oldHeader = data.bedenler.headers[headerIndex]
    const newHeaders = data.bedenler.headers.filter((_, i) => i !== headerIndex)
    const newRows = data.bedenler.rows.map(row => {
      const newValues = { ...row.values }
      delete newValues[oldHeader]
      return { ...row, values: newValues }
    })
    handleUpdate("bedenler", { headers: newHeaders, rows: newRows })
  }

  return (
    <>
      <div className="flex flex-col h-full bg-neutral-100 overflow-y-auto p-4 md:p-8 items-center print:p-0 print:bg-white print:overflow-visible">
      
      {/* ==============================
          Masaüstü Görünümü (Desktop/Print)
          ============================== */}
      <div className="hidden lg:block print:block w-full max-w-[900px] print:max-w-none bg-white border-2 border-neutral-800 shadow-sm p-0 text-[11px] font-medium text-neutral-800 text-center" id="kesim-kontrol-print-area">
        
        {/* UPPER SECTION: HEADER */}
        <div className="flex border-b-2 border-neutral-800">
          <div className="w-1/4 bg-yellow-400 border-r-2 border-neutral-800 p-2 font-black text-[10px] flex items-center justify-center text-center tracking-widest text-neutral-900 uppercase">
            GZL TEKSTİL
          </div>
          <div className="flex-1 bg-yellow-300 p-2 font-black text-[13px] flex items-center justify-center text-center tracking-[0.2em] text-neutral-900 uppercase">
            KESİM KONTROL FÖYÜ
          </div>
        </div>

        {/* TOP SECTION */}
        <div className="flex border-b-2 border-neutral-800">
          {/* Empty Space / Logo Placeholder if needed, or we just merge it */}
          <div className="w-1/4 bg-white border-r-2 border-neutral-800 flex items-center justify-center p-4">
          </div>
          
          <div className="w-3/4 flex flex-col">
            {/* Row 1 */}
            <div className="flex border-b border-neutral-800">
              <div className="w-1/4 bg-neutral-100 p-2 border-r border-neutral-800 flex items-center justify-center font-bold text-[10px]">MODEL KODU</div>
              <div className="w-1/4 border-r border-neutral-800">
                <input 
                  value={data.modelKodu} 
                  onChange={e => handleUpdate("modelKodu", e.target.value)}
                  className="w-full h-full p-2 focus:outline-none bg-yellow-50/30 text-center text-[11px]"
                />
              </div>
              <div className="w-1/4 bg-neutral-100 p-2 border-r border-neutral-800 flex items-center justify-center font-bold text-[10px]">KESİM TARİHİ</div>
              <div className="w-1/4 flex items-center justify-center px-2 relative">
                <input 
                  value={data.kesimTarihi} 
                  onChange={e => handleDateUpdate(e.target.value)}
                  placeholder="..../..../20...."
                  className="w-full h-full p-2 focus:outline-none text-center text-[11px]"
                />
              </div>
            </div>
            {/* Row 2 */}
            <div className="flex">
              <div className="w-1/4 bg-neutral-100 p-2 border-r border-neutral-800 flex items-center justify-center font-bold text-[10px]">SEZON/MARKA</div>
              <div className="w-1/4 border-r border-neutral-800">
                <input 
                  value={data.sezonMarka} 
                  onChange={e => handleUpdate("sezonMarka", e.target.value)}
                  className="w-full h-full p-2 focus:outline-none bg-yellow-50/30 text-center text-[11px]"
                />
              </div>
              <div className="w-1/4 bg-neutral-100 p-2 border-r border-neutral-800 flex items-center justify-center font-bold text-[10px]">SAP KODU</div>
              <div className="w-1/4">
                <input 
                  maxLength={9}
                  value={data.sapKodu} 
                  onChange={e => handleUpdate("sapKodu", e.target.value)}
                  className="w-full h-full p-2 focus:outline-none text-center text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: KUMAŞLAR */}
        <div className="border-b-2 border-neutral-800">
          <div className="flex bg-sky-400 text-sky-950 font-black tracking-wide border-b-2 border-neutral-800 text-[10px]">
            <div className="w-1/5 p-1.5 border-r border-neutral-800 text-center"></div>
            <div className="w-1/5 p-1.5 border-r border-neutral-800 flex justify-center items-center">KODU</div>
            <div className="w-1/5 p-1.5 border-r border-neutral-800 flex justify-center items-center">KULLANIM YERİ</div>
            <div className="w-1/5 p-1.5 border-r border-neutral-800 flex justify-center items-center">BİRİM METRE</div>
            <div className="w-1/5 p-1.5 flex justify-center items-center">KUMAŞÇI FİRMA</div>
          </div>
          
          {data.kumaslar.map((kumas, i) => (
            <div key={i} className="flex border-b border-neutral-800 last:border-b-0 bg-sky-50/30 group relative">
              {/* TABLO DIŞI BUTONLAR */}
              <div className="absolute -left-14 top-0 bottom-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                <button type="button" onClick={() => removeKumas(i)} className="text-red-500 bg-red-100 hover:bg-red-200 rounded w-6 h-6 flex items-center justify-center font-black" title="Kumaş Sil">-</button>
                {i === data.kumaslar.length - 1 && (
                  <button type="button" onClick={addKumas} className="text-green-600 bg-green-100 hover:bg-green-200 rounded w-6 h-6 flex items-center justify-center font-black" title="Kumaş Ekle">+</button>
                )}
              </div>

              <div className="w-1/5 p-1.5 border-r border-neutral-800 flex items-center justify-center font-bold text-[10px] bg-sky-100/50">
                KUMAŞ {i + 1}
              </div>
              <div className="w-1/5 border-r border-neutral-800">
                <input value={kumas.kodu} onChange={e => handleKumasUpdate(i, "kodu", e.target.value)} className="w-full h-full p-1.5 focus:outline-none bg-transparent text-center text-[11px]" />
              </div>
              <div className="w-1/5 border-r border-neutral-800">
                <input value={kumas.kullanimYeri} onChange={e => handleKumasUpdate(i, "kullanimYeri", e.target.value)} className="w-full h-full p-1.5 focus:outline-none bg-transparent text-center text-[11px]" />
              </div>
              <div className="w-1/5 border-r border-neutral-800">
                <input value={kumas.birimMetre} onChange={e => handleKumasUpdate(i, "birimMetre", e.target.value)} className="w-full h-full p-1.5 focus:outline-none bg-transparent text-center text-[11px]" />
              </div>
              <div className="w-1/5">
                <input value={kumas.kumasciFirma} onChange={e => handleKumasUpdate(i, "kumasciFirma", e.target.value)} className="w-full h-full p-1.5 focus:outline-none bg-transparent text-center text-[11px]" />
              </div>
            </div>
          ))}
        </div>

        {/* LOWER SECTION: BEDENLER */}
        <div className="border-t-4 border-b-2 border-neutral-800 mt-2">
          <div className="flex bg-orange-200/90 text-orange-950 font-black tracking-wide border-b-2 border-neutral-800 text-center text-[10px] relative">
            <div className="w-[18%] p-2 border-r border-neutral-800 flex items-center justify-center">KUMAŞ TÜRÜ</div>
            <div className="flex-1 flex border-r border-neutral-800 relative">
              {data.bedenler.headers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button type="button" onClick={addHeader} className="text-green-600 bg-green-100 hover:bg-green-200 rounded px-2 py-1 font-black text-[10px] print:hidden">+ SÜTUN EKLE</button>
                </div>
              )}
              {data.bedenler.headers.map((header, hi) => (
                <div key={hi} className="flex-1 border-r border-neutral-800 last:border-r-0 flex flex-col relative group/header">
                  {/* TABLO DIŞI BUTONLAR FOR HEADERS */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 print:hidden z-10">
                    <button type="button" onClick={() => removeHeader(hi)} className="text-red-500 bg-red-100 hover:bg-red-200 hover:text-red-600 rounded-full shadow-sm w-5 h-5 flex items-center justify-center transition-colors border border-red-200" title="Sütun Sil">
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    {hi === data.bedenler.headers.length - 1 && (
                      <button type="button" onClick={addHeader} className="text-emerald-600 bg-emerald-100 hover:bg-emerald-200 hover:text-emerald-700 rounded-full shadow-sm w-5 h-5 flex items-center justify-center transition-colors border border-emerald-200" title="Sütun Ekle">
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                  <input 
                    value={header}
                    onChange={e => handleHeaderUpdate(hi, e.target.value)}
                    className="w-full h-full p-2 bg-transparent text-center focus:outline-none focus:bg-orange-300/50 uppercase"
                  />
                </div>
              ))}
            </div>
            <div className="w-[12%] p-1 border-r border-neutral-800 flex items-center justify-center">TOPLAM<br/>ADET</div>
            <div className="w-[12%] p-1 flex items-center justify-center">KESİLEN<br/>TOPLAM<br/>MT</div>
          </div>

          {data.bedenler.rows.length === 0 && (
            <div className="p-4 flex items-center justify-center bg-orange-50/20 border-b border-neutral-800">
              <button type="button" onClick={addBeden} className="text-green-600 bg-green-100 hover:bg-green-200 rounded px-4 py-2 font-black text-xs print:hidden">+ BEDEN EKLE</button>
            </div>
          )}

          {data.bedenler.rows.map((beden, i) => (
            <div key={beden.id || i} className="flex border-b border-neutral-800 last:border-b-0 bg-orange-50/20 group relative">
              {/* TABLO DIŞI BUTONLAR */}
              <div className="absolute -left-14 top-0 bottom-0 flex items-center justify-center gap-1 print:hidden">
                <button type="button" onClick={() => removeBeden(i)} className="text-red-500 bg-red-100 hover:bg-red-200 hover:text-red-600 rounded-full shadow-sm w-5 h-5 flex items-center justify-center transition-colors border border-red-200" title="Beden Sil">
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>
                {i === data.bedenler.rows.length - 1 && (
                  <button type="button" onClick={addBeden} className="text-emerald-600 bg-emerald-100 hover:bg-emerald-200 hover:text-emerald-700 rounded-full shadow-sm w-5 h-5 flex items-center justify-center transition-colors border border-emerald-200" title="Beden Ekle">
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
              </div>

              <div className="w-[18%] border-r border-neutral-800">
                <input value={beden.kumasTuru} onChange={e => handleBedenUpdate(i, "kumasTuru", e.target.value)} className="w-full h-14 p-1 focus:outline-none bg-transparent text-center text-[11px] font-bold" />
              </div>
              <div className="flex-1 flex border-r border-neutral-800">
                {data.bedenler.headers.map((header, hi) => (
                  <div key={hi} className="flex-1 border-r border-neutral-800 last:border-r-0">
                    <input 
                      value={beden.values[header] || ""} 
                      onChange={e => handleBedenValueUpdate(i, header, e.target.value)} 
                      className="w-full h-14 p-1 text-center focus:outline-none bg-transparent text-[11px]" 
                    />
                  </div>
                ))}
              </div>
              <div className="w-[12%] border-r border-neutral-800">
                <input value={beden.toplamAdet} onChange={e => handleBedenUpdate(i, "toplamAdet", e.target.value)} type="number" className="w-full h-14 p-1 focus:outline-none bg-transparent text-center font-bold text-[11px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div className="w-[12%]">
                <input value={beden.kesilenMt} onChange={e => handleBedenUpdate(i, "kesilenMt", e.target.value)} type="number" className="w-full h-14 p-1 focus:outline-none bg-transparent text-center font-bold text-[11px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: NOTLAR */}
        <div className="border-x-2 border-b-2 border-neutral-800 mt-0 h-32 bg-sky-50 flex flex-col relative">
          <div className="font-bold text-red-600 underline p-2 absolute top-0 left-0">NOTLAR:</div>
          <textarea 
            value={data.notlar} 
            onChange={e => handleUpdate("notlar", e.target.value)}
            className="w-full h-full pt-8 p-2 resize-none focus:outline-none bg-transparent text-left"
          />
        </div>

      </div>

      {/* ==============================
          MOBİL GÖRÜNÜM (Kart Yapısı)
          ============================== */}
      <div className="block lg:hidden print:hidden w-full max-w-lg mx-auto space-y-4">
        
        {/* Mobil Sarı Başlık */}
        <div className="bg-yellow-400 p-3 rounded-t-2xl shadow-sm text-center border-2 border-neutral-800">
          <h2 className="text-sm font-black text-neutral-900 tracking-widest">GZL TEKSTİL</h2>
          <h1 className="text-xl font-black text-neutral-900 tracking-wide mt-1">KESİM KONTROL</h1>
        </div>

        {/* Üst Bilgiler */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
          {[
            { label: "Model Kodu", field: "modelKodu", ph: "Örn: ME777" },
            { label: "Kesim Tarihi", field: "kesimTarihi", isDate: true },
            { label: "Sezon / Marka", field: "sezonMarka", ph: "Örn: SS26" },
            { label: "SAP Kodu", field: "sapKodu", max: 9, ph: "123456789" },
          ].map((col, i) => (
            <div key={i} className="flex items-center p-3">
              <span className="w-1/3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{col.label}</span>
              <div className="w-2/3">
                <input
                  value={data[col.field as keyof KesimKontrolRecord] as string}
                  onChange={col.isDate ? e => handleDateUpdate(e.target.value) : e => handleUpdate(col.field as keyof KesimKontrolRecord, e.target.value)}
                  maxLength={col.max}
                  placeholder={col.isDate ? "GG/AA/YYYY" : col.ph}
                  className="w-full text-sm font-semibold text-neutral-900 focus:outline-none bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Kumaşlar Listesi */}
        <div className="flex items-center justify-between px-2 pt-2">
          <h3 className="text-sm font-black text-sky-900 uppercase tracking-wider">Kumaş / Pastal Kartları</h3>
          <button type="button" onClick={addKumas} className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-2 py-1 rounded-md border border-sky-200 transition-colors">
            + Kumaş Ekle
          </button>
        </div>
        <div className="space-y-3">
          {data.kumaslar.map((kumas, i) => (
            <div key={i} className="bg-white border border-sky-200 rounded-xl overflow-hidden shadow-sm relative">
              <div className="bg-sky-50 p-2 border-b border-sky-100 flex items-center justify-between">
                <span className="text-xs font-black text-sky-700 tracking-widest uppercase">Kumaş {i + 1}</span>
                <button type="button" onClick={() => removeKumas(i)} className="text-red-500 hover:bg-red-100 bg-white border border-red-200 rounded px-2 py-0.5 text-[10px] font-bold transition-colors">
                  SİL
                </button>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3 bg-white">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Kodu</label>
                  <input value={kumas.kodu} onChange={e => handleKumasUpdate(i, "kodu", e.target.value)} 
                    className="w-full text-sm font-semibold text-neutral-800 bg-neutral-50 rounded p-1.5 focus:outline-none border border-neutral-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Kullanım Yeri</label>
                  <input value={kumas.kullanimYeri} onChange={e => handleKumasUpdate(i, "kullanimYeri", e.target.value)} 
                    className="w-full text-sm font-semibold text-neutral-800 bg-neutral-50 rounded p-1.5 focus:outline-none border border-neutral-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Birim Metre</label>
                  <input value={kumas.birimMetre} onChange={e => handleKumasUpdate(i, "birimMetre", e.target.value)} 
                    className="w-full text-sm font-semibold text-neutral-800 bg-neutral-50 rounded p-1.5 focus:outline-none border border-neutral-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Firma</label>
                  <input value={kumas.kumasciFirma} onChange={e => handleKumasUpdate(i, "kumasciFirma", e.target.value)} 
                    className="w-full text-sm font-semibold text-neutral-800 bg-neutral-50 rounded p-1.5 focus:outline-none border border-neutral-200" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bedenler Listesi */}
        <div className="flex items-center justify-between px-2 pt-2">
          <h3 className="text-sm font-black text-orange-900 uppercase tracking-wider">Beden Kesim Bilgileri</h3>
          <div className="flex gap-2">
            <button type="button" onClick={addHeader} className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-2 py-1 rounded-md border border-neutral-200 transition-colors">
              + Sütun Ekle
            </button>
            <button type="button" onClick={addBeden} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold px-2 py-1 rounded-md border border-orange-200 transition-colors">
              + Beden Ekle
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {data.bedenler.rows.map((b, i) => (
            <div key={b.id || i} className="bg-white border border-orange-200 rounded-xl overflow-hidden shadow-sm relative">
              <div className="bg-orange-50 p-2 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Tür:</span>
                  <input value={b.kumasTuru} onChange={e => handleBedenUpdate(i, "kumasTuru", e.target.value)} 
                    className="flex-1 bg-transparent text-sm font-black text-orange-900 focus:outline-none" placeholder="Örn: ANA KUMAŞ" />
                </div>
                <button type="button" onClick={() => removeBeden(i)} className="text-red-500 hover:bg-red-100 bg-white border border-red-200 rounded px-2 py-0.5 text-[10px] font-bold transition-colors ml-2">
                  SİL
                </button>
              </div>
              <div className="p-3">
                {/* Dinamik Beden Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {data.bedenler.headers.map((header, hi) => (
                    <div key={hi} className="bg-neutral-50 rounded-lg p-2 border border-neutral-200 text-center flex flex-col relative group">
                      <input 
                        value={header}
                        onChange={e => handleHeaderUpdate(hi, e.target.value)}
                        className="text-[10px] font-bold text-neutral-500 mb-1 w-full text-center bg-transparent focus:outline-none focus:bg-neutral-200 rounded uppercase"
                      />
                      <input value={b.values[header] || ""} onChange={e => handleBedenValueUpdate(i, header, e.target.value)} type="number"
                        className="w-full text-center text-sm font-black text-neutral-800 bg-transparent focus:outline-none" placeholder="0" />
                      <button type="button" onClick={() => removeHeader(hi)} className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 shadow-sm text-white rounded-full w-4 h-4 flex items-center justify-center print:hidden z-10 transition-colors border border-white" title="Sütunu Sil">
                        <Trash2 className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Toplam Adet ve Kesilen Mt */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-100">
                  <div className="bg-sky-50 rounded-lg p-2 border border-sky-100 text-center">
                    <span className="block text-[10px] font-bold text-sky-600 mb-1">TOPLAM ADET</span>
                    <input value={b.toplamAdet} onChange={e => handleBedenUpdate(i, "toplamAdet", e.target.value)} type="number"
                      className="w-full text-center text-sm font-black text-sky-900 bg-transparent focus:outline-none" placeholder="0" />
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-100 text-center">
                    <span className="block text-[10px] font-bold text-green-700 mb-1">KESİLEN MT</span>
                    <input value={b.kesilenMt} onChange={e => handleBedenUpdate(i, "kesilenMt", e.target.value)} type="number"
                      className="w-full text-center text-sm font-black text-green-900 bg-transparent focus:outline-none" placeholder="0" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Not / Kritik */}
        <div className="bg-white border-2 border-red-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-red-50 p-2 border-b border-red-200">
            <span className="text-xs font-black text-red-600 uppercase tracking-widest ml-1">Not / Kritik</span>
          </div>
          <textarea
            value={data.notlar}
            onChange={e => handleUpdate("notlar", e.target.value)}
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
