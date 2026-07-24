"use server"

import prisma from "@/lib/prisma"
import { requireMutationAuth } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function getNotes() {
  try {
    const notes = await prisma.isNotu.findMany({
      orderBy: { sira: 'asc' }
    })
    return { success: true, data: notes }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function saveNotes(notes: { id?: string, icerik: string, renk: string, sira: number }[]) {
  try {
    await requireMutationAuth()
    
    await prisma.$transaction(async (tx) => {
      await tx.isNotu.deleteMany()
      
      if (notes.length > 0) {
        await tx.isNotu.createMany({
          data: notes.map(n => ({
            icerik: n.icerik,
            renk: n.renk,
            sira: n.sira
          }))
        })
      }
    })

    revalidatePath("/is-notlarim")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
