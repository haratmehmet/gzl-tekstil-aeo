export interface CekmeKumasDetay {
  id: string
  kullanildigiYer: string
  kumasIcerik: string
  tedarikci: string
  artikelAdi: string
  urunDptRenk: string
  gelenMetraj: number | string
  kumasEn: number | string
  enCekmeYuzde: number | string
  boyCekmeYuzde: number | string
}

export interface CekmeFoyu {
  id: string
  sezon: string
  testeGonderilmeTarihi: string
  modelist: string
  etiket: string
  modelKodu: string
  sapKodu: string
  kumasKodu: string
  renk?: string | null
  fabrics: CekmeKumasDetay[]
  createdAt: string
  updatedAt: string
}
