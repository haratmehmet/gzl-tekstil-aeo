import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Eski kayıtları güncelleme işlemi başlıyor...")

  const depolar = await prisma.kumasDeposu.findMany({
    where: {
      takipFoyuId: { not: null }
    }
  })

  let updateCount = 0

  for (const depo of depolar) {
    if (!depo.takipFoyuId) continue

    const takip = await prisma.kumasTakip.findUnique({
      where: { id: depo.takipFoyuId }
    })

    if (takip) {
      const yeniBaglananModel = `${takip.baglandigiModel || ""} - ${takip.kullanildigiYer || ""}`.trim().replace(/^-|-$/g, "").trim()

      if (depo.baglananModel !== yeniBaglananModel) {
        await prisma.kumasDeposu.update({
          where: { id: depo.id },
          data: { baglananModel: yeniBaglananModel }
        })
        updateCount++
      }
    }
  }

  console.log(`İşlem tamamlandı! ${updateCount} adet eski kayıt başarıyla güncellendi.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
