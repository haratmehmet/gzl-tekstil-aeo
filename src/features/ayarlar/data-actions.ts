"use server"

import prisma from "@/lib/prisma"

export async function exportDatabase() {
  try {
    const kumasTakip = await prisma.kumasTakip.findMany({ include: { rolls: true } })
    const cekmeFoyu = await prisma.cekmeFoyu.findMany({ include: { fabrics: true } })
    const kalanKumas = await prisma.kalanKumas.findMany()
    const kumasDeposu = await prisma.kumasDeposu.findMany()
    const kesimKontrolFoyu = await prisma.kesimKontrolFoyu.findMany()
    const uretimTakipFoyu = await prisma.uretimTakipFoyu.findMany()
    const uretimSezon = await prisma.uretimSezon.findMany({ include: { genelUretimKayitlar: true } })
    const users = await prisma.user.findMany()
    const systemSettings = await prisma.systemSettings.findMany()

    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      kumasTakip,
      cekmeFoyu,
      kalanKumas,
      kumasDeposu,
      kesimKontrolFoyu,
      uretimTakipFoyu,
      uretimSezon,
      users,
      systemSettings
    }

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function importDatabase(data: any) {
  try {
    if (!data.version || !data.exportDate) {
      throw new Error("Geçersiz yedek dosyası (version/exportDate bulunamadı).")
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete everything
      await tx.roll.deleteMany()
      await tx.kumasTakip.deleteMany()
      
      await tx.cekmeFabric.deleteMany()
      await tx.cekmeFoyu.deleteMany()
      
      await tx.kalanKumas.deleteMany()
      await tx.kumasDeposu.deleteMany()
      
      await tx.kesimKontrolFoyu.deleteMany()
      await tx.uretimTakipFoyu.deleteMany()
      
      await tx.genelUretimKayit.deleteMany()
      await tx.uretimSezon.deleteMany()

      await tx.user.deleteMany()
      await tx.systemSettings.deleteMany()

      // 2. Insert everything
      if (data.users?.length) {
        await tx.user.createMany({ data: data.users })
      }
      
      if (data.systemSettings?.length) {
        await tx.systemSettings.createMany({ data: data.systemSettings })
      }

      for (const sheet of (data.kumasTakip || [])) {
        const { rolls, ...sheetData } = sheet;
        await tx.kumasTakip.create({
          data: {
            ...sheetData,
            rolls: { create: rolls || [] }
          }
        })
      }

      for (const foy of (data.cekmeFoyu || [])) {
        const { fabrics, ...foyData } = foy;
        await tx.cekmeFoyu.create({
          data: {
            ...foyData,
            fabrics: { create: fabrics || [] }
          }
        })
      }

      if (data.kalanKumas?.length) {
        await tx.kalanKumas.createMany({ 
          data: data.kalanKumas.map((k: any) => ({
            ...k,
            notlar: k.notlar || undefined
          }))
        })
      }

      if (data.kumasDeposu?.length) {
        await tx.kumasDeposu.createMany({ data: data.kumasDeposu })
      }

      if (data.kesimKontrolFoyu?.length) {
        await tx.kesimKontrolFoyu.createMany({ 
          data: data.kesimKontrolFoyu.map((k: any) => ({
            ...k,
            kumaslar: k.kumaslar || undefined,
            bedenler: k.bedenler || undefined
          }))
        })
      }

      if (data.uretimTakipFoyu?.length) {
        await tx.uretimTakipFoyu.createMany({ 
          data: data.uretimTakipFoyu.map((k: any) => ({
            ...k,
            bedenler: k.bedenler || undefined
          }))
        })
      }

      for (const sezon of (data.uretimSezon || [])) {
        const { genelUretimKayitlar, ...sezonData } = sezon;
        await tx.uretimSezon.create({
          data: {
            ...sezonData,
            genelUretimKayitlar: { create: genelUretimKayitlar || [] }
          }
        })
      }
    }, { timeout: 30000 })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
