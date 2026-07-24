import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireMutationAuth } from "@/lib/session"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireMutationAuth();
    const data = await req.json()
    const { id } = await context.params
    const { kumaslar, bedenler, ...rest } = data

    const updated = await prisma.kesimKontrolFoyu.update({
      where: { id },
      data: {
        ...rest,
        kumaslar: kumaslar || [],
        bedenler: bedenler || [],
      },
    })

    return NextResponse.json({
      ...updated,
      kumaslar: kumaslar || [],
      bedenler: bedenler || [],
    })
  } catch (error) {
    console.error("PUT Kesim Kontrol Hatası:", error)
    return NextResponse.json({ error: "Kayıt güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireMutationAuth();
    const { id } = await context.params
    await prisma.kesimKontrolFoyu.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE Kesim Kontrol Hatası:", error)
    return NextResponse.json({ error: "Kayıt silinemedi" }, { status: 500 })
  }
}
