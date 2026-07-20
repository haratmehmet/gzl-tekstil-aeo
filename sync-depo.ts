import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncDepo() {
  const takipler = await prisma.kumasTakip.findMany()
  console.log(`Bulunan takip föyü sayısı: ${takipler.length}`)

  let eklendi = 0
  for (const t of takipler) {
    const formattedAmount = `${Number(t.gelenMetraj).toFixed(2).replace('.', ',')} ${t.birim === 'KG' ? 'Kg' : 'Mt'}`

    const existing = await prisma.kumasDeposu.findFirst({
      where: { takipFoyuId: t.id },
      orderBy: { eklenmeTarihi: 'asc' }
    })

    if (!existing) {
      await prisma.kumasDeposu.create({
        data: {
          tarih: t.geldigiTarih || "",
          renk: t.kumasRenk || "",
          firma: t.kumasciFirma || "",
          sezon: t.sezon || "",
          kumasKodu: t.kumasKodu || "",
          gelenMetraj: formattedAmount,
          kesimTarihi: "",
          baglananModel: t.baglandigiModel || "",
          kesilenAdet: "",
          aciklama: "",
          harcananMetraj: "",
          netMetraj: formattedAmount,
          takipFoyuId: t.id
        }
      })
      eklendi++
    }
  }

  console.log(`${eklendi} adet yeni kayıt Kumaş Deposuna başarıyla eklendi!`)
}

syncDepo().catch(console.error).finally(() => prisma.$disconnect())
