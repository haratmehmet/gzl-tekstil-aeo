"use server"

import prisma from "@/lib/prisma"

export async function getDashboardStats() {
  try {
    // 1. Toplam Takip Föyü
    const totalTakipFoyu = await prisma.kumasTakip.count()

    // 2. Kumaş Deposu Toplam Mt (netMetraj is string, so we calculate in JS)
    const deposuKayitlar = await prisma.kumasDeposu.findMany({ select: { netMetraj: true } })
    let totalMt = 0
    for (const r of deposuKayitlar) {
      const cleanVal = r.netMetraj.replace(/\s/g, '').replace(',', '.')
      const parsed = parseFloat(cleanVal)
      if (!isNaN(parsed)) {
        totalMt += parsed
      }
    }

    // 3. Aktif Sezonlar
    const activeSeasonsCount = await prisma.uretimSezon.count()

    // 4. Son İşlemler (Son 5 Takip Föyü kaydı)
    const recentTxData = await prisma.kumasTakip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        kumasKodu: true,
        kullanildigiYer: true,
        gelenMetraj: true,
        createdAt: true,
      }
    })

    const recentTransactions = recentTxData.map(t => ({
      id: t.id,
      fabric: t.kumasKodu,
      type: t.kullanildigiYer || "Belirtilmemiş",
      amount: t.gelenMetraj + " mt",
      date: new Date(t.createdAt).toLocaleString("tr-TR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: "Eklendi"
    }))

    // 5. Kumaş Türü Dağılımı
    const kumasTakipList = await prisma.kumasTakip.findMany({
      select: { kullanildigiYer: true }
    })

    const usageCount: Record<string, number> = {}
    for (const item of kumasTakipList) {
      const t = item.kullanildigiYer?.trim() || "Diğer"
      usageCount[t] = (usageCount[t] || 0) + 1
    }

    const totalTypes = kumasTakipList.length || 1
    const fabricTypes = Object.keys(usageCount).map(key => {
      const count = usageCount[key]
      const percentage = Math.round((count / totalTypes) * 100)
      return { label: key, percentage, count }
    }).sort((a, b) => b.count - a.count)

    return {
      success: true,
      data: {
        totalTakipFoyu,
        totalMt: totalMt.toLocaleString("tr-TR"),
        activeSeasonsCount,
        recentTransactions,
        fabricTypes
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
