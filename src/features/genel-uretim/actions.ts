"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUretimSezonlar() {
  try {
    const sezonlar = await prisma.uretimSezon.findMany({
      orderBy: { createdAt: "desc" }
    })
    return { success: true, data: sezonlar }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addUretimSezon(ad: string) {
  try {
    if (!ad || ad.trim() === "") {
      return { success: false, error: "Sezon adı boş olamaz" }
    }
    const newSezon = await prisma.uretimSezon.create({
      data: { ad: ad.trim() }
    })
    revalidatePath("/raporlar")
    return { success: true, data: newSezon }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUretimSezon(id: string) {
  try {
    await prisma.uretimSezon.delete({
      where: { id }
    })
    revalidatePath("/raporlar")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getGenelUretimKayitlar(sezonId: string, markaTipi: string) {
  try {
    const kayitlar = await prisma.genelUretimKayit.findMany({
      where: { sezonId, markaTipi },
      orderBy: { createdAt: "asc" }
    })
    return { success: true, data: kayitlar }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addGenelUretimKayit(sezonId: string, markaTipi: string) {
  try {
    const yeniKayit = await prisma.genelUretimKayit.create({
      data: {
        sezonId,
        markaTipi,
        siparisId: "",
        sapKodu: "",
        modelKodu: "",
        modelist: "",
        butceAdet: "",
        kumasGelisTarihi: "",
        cekmeTesti: "",
        fitKalibiGelis: "",
        fitDikildi: "",
        uretimPastali: "",
        kesimiTamamlandi: "",
        kaliteKontrol: "",
        teslimTarihi: ""
      }
    })
    revalidatePath("/raporlar")
    return { success: true, data: yeniKayit }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateGenelUretimKayit(id: string, data: any) {
  try {
    const guncelKayit = await prisma.genelUretimKayit.update({
      where: { id },
      data
    })
    revalidatePath("/raporlar")
    return { success: true, data: guncelKayit }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteGenelUretimKayit(id: string) {
  try {
    await prisma.genelUretimKayit.delete({
      where: { id }
    })
    revalidatePath("/raporlar")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateGenelUretimKayitBulkColor(ids: string[], color: string) {
  try {
    await prisma.genelUretimKayit.updateMany({
      where: { id: { in: ids } },
      data: { satirRengi: color }
    })
    revalidatePath("/raporlar")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
