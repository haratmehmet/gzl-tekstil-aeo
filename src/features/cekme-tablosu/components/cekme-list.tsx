"use client"

import * as React from "react"
import { CekmeFoyu } from "../types"

interface CekmeListProps {
  foyler: CekmeFoyu[]
  onEdit: (foy: CekmeFoyu) => void
}

export function CekmeList({ foyler, onEdit }: CekmeListProps) {
  if (foyler.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-neutral-200 rounded-xl shadow-sm">
        <p className="text-sm font-medium text-neutral-500">Bu sezona ait kayıt bulunmamaktadır.</p>
      </div>
    )
  }

  // Common th style
  const thStyle = "px-2 py-3 border border-neutral-300 text-[10px] font-bold text-center uppercase whitespace-nowrap"
  const tdStyle = "px-2 py-2 border border-neutral-300 text-[11px] text-center whitespace-nowrap bg-white cursor-pointer hover:bg-neutral-50"

  // Background colors corresponding to the Excel visual
  const bgGray = "bg-[#d9d9d9]"
  const bgBlue = "bg-[#9bc2e6]"
  const fabricColors = ["bg-[#e2a0d9]", "bg-[#f4b084]", "bg-[#a9d08e]"] // Pink, Peach, Green

  return (
    <div className="w-full bg-white border border-neutral-300 shadow-lg rounded-xl overflow-hidden">
      {/* MASAÜSTÜ GÖRÜNÜMÜ */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr>
              {/* General Info */}
              <th className={`${thStyle} ${bgGray}`}>TESTE GÖNDERİLME<br/>TARİHİ</th>
              <th className={`${thStyle} ${bgGray}`}>MODELİST</th>
              <th className={`${thStyle} ${bgGray}`}>ETİKET</th>
              <th className={`${thStyle} ${bgGray}`}>MODEL KODU</th>
              <th className={`${thStyle} ${bgGray}`}>SAP KODU</th>
              <th className={`${thStyle} ${bgBlue}`}>KUMAŞ KODU</th>

              {/* Loop for 3 potential fabrics just to draw headers */}
              {[0, 1, 2].map((i) => (
                <React.Fragment key={`th-fab-${i}`}>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>KULLANILDIĞI<br/>YER</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>KUMAŞ İÇERİK</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>TEDARİKÇİ</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>ARTİKEL<br/>ADI</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>ÜRÜN DPT<br/>RENK</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>GELEN METRAJ</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>KUMAŞ EN</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>EN ÇEKME<br/>%DİR</th>
                  <th className={`${thStyle} ${fabricColors[i % 3]}`}>BOY ÇEKME<br/>%DİR</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {foyler.map((foy) => (
              <tr key={foy.id} onClick={() => onEdit(foy)} className="group transition-colors">
                <td className={tdStyle}>{foy.testeGonderilmeTarihi ? new Date(foy.testeGonderilmeTarihi).toLocaleDateString("tr-TR") : "-"}</td>
                <td className={tdStyle}>{foy.modelist}</td>
                <td className={tdStyle}>{foy.etiket}</td>
                <td className={tdStyle}>{foy.modelKodu}</td>
                <td className={tdStyle}>{foy.sapKodu}</td>
                <td className={tdStyle}>{foy.kumasKodu}</td>
                
                {[0, 1, 2].map((i) => {
                  const fab = foy.fabrics[i]
                  if (fab) {
                    return (
                      <React.Fragment key={`td-fab-${foy.id}-${i}`}>
                        <td className={tdStyle}>{fab.kullanildigiYer}</td>
                        <td className={tdStyle}>{fab.kumasIcerik}</td>
                        <td className={tdStyle}>{fab.tedarikci}</td>
                        <td className={tdStyle}>{fab.artikelAdi}</td>
                        <td className={tdStyle}>{fab.urunDptRenk}</td>
                        <td className={tdStyle}>{fab.gelenMetraj}</td>
                        <td className={tdStyle}>{fab.kumasEn}</td>
                        <td className={tdStyle}>{fab.enCekmeYuzde}</td>
                        <td className={tdStyle}>{fab.boyCekmeYuzde}</td>
                      </React.Fragment>
                    )
                  } else {
                    return (
                      <React.Fragment key={`td-fab-${foy.id}-empty-${i}`}>
                        <td className={tdStyle}></td><td className={tdStyle}></td>
                        <td className={tdStyle}></td><td className={tdStyle}></td>
                        <td className={tdStyle}></td><td className={tdStyle}></td>
                        <td className={tdStyle}></td><td className={tdStyle}></td>
                        <td className={tdStyle}></td>
                      </React.Fragment>
                    )
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBİL GÖRÜNÜM (KARTLAR) */}
      <div className="block lg:hidden bg-neutral-50/50 p-2 sm:p-4">
        <div className="space-y-4">
          {foyler.map((foy) => (
            <div 
              key={foy.id} 
              onClick={() => onEdit(foy)}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden cursor-pointer hover:border-sky-300 transition-colors"
            >
              {/* Üst Kısım: Genel Bilgiler */}
              <div className="p-3 bg-gradient-to-br from-neutral-50 to-neutral-100 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Model Kodu</div>
                  <div className="text-sm font-black text-neutral-800">{foy.modelKodu || "-"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">SAP Kodu</div>
                  <div className="text-sm font-black text-neutral-800">{foy.sapKodu || "-"}</div>
                </div>
              </div>
              
              {/* Orta Kısım: Diğer Temel Alanlar */}
              <div className="p-3 grid grid-cols-2 gap-3 border-b border-neutral-100">
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase mb-0.5">Kumaş Kodu</div>
                  <div className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded w-max">{foy.kumasKodu || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase mb-0.5">Test Tarihi</div>
                  <div className="text-xs font-medium text-neutral-700">{foy.testeGonderilmeTarihi ? new Date(foy.testeGonderilmeTarihi).toLocaleDateString("tr-TR") : "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase mb-0.5">Modelist</div>
                  <div className="text-xs font-medium text-neutral-700">{foy.modelist || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase mb-0.5">Etiket</div>
                  <div className="text-xs font-medium text-neutral-700">{foy.etiket || "-"}</div>
                </div>
              </div>

              {/* Alt Kısım: Kumaş Detayları */}
              <div className="p-3 bg-white space-y-3">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 border-b border-neutral-100 pb-1">Kumaş Detayları</div>
                {foy.fabrics.length === 0 && <div className="text-xs text-neutral-500 italic">Kumaş bilgisi yok.</div>}
                
                {foy.fabrics.map((fab, i) => (
                  <div key={i} className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-neutral-500 uppercase">Kumaş {i + 1}</span>
                      <span className="text-[10px] font-bold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">{fab.kullanildigiYer || "-"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                      <div className="flex justify-between items-center bg-white px-1.5 py-1 rounded text-[10px]">
                        <span className="text-neutral-400 font-bold">İçerik:</span>
                        <span className="text-neutral-800 font-semibold">{fab.kumasIcerik || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white px-1.5 py-1 rounded text-[10px]">
                        <span className="text-neutral-400 font-bold">Ted.:</span>
                        <span className="text-neutral-800 font-semibold truncate max-w-[80px]" title={fab.tedarikci}>{fab.tedarikci || "-"}</span>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-orange-50 border border-orange-100 p-1.5 rounded-lg text-center">
                          <div className="text-[9px] font-bold text-orange-600 mb-0.5">EN ÇEKME</div>
                          <div className="text-xs font-black text-orange-900">{fab.enCekmeYuzde ? `%${fab.enCekmeYuzde}` : "-"}</div>
                        </div>
                        <div className="bg-fuchsia-50 border border-fuchsia-100 p-1.5 rounded-lg text-center">
                          <div className="text-[9px] font-bold text-fuchsia-600 mb-0.5">BOY ÇEKME</div>
                          <div className="text-xs font-black text-fuchsia-900">{fab.boyCekmeYuzde ? `%${fab.boyCekmeYuzde}` : "-"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
