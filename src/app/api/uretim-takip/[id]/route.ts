import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { bedenler, ...rest } = await req.json()
    const updated = await prisma.uretimTakipFoyu.update({
      where: { id },
      data: { ...rest, bedenler: bedenler || [] },
    })
    return NextResponse.json({ ...updated, bedenler: updated.bedenler ?? [] })
  } catch (error: any) {
    return NextResponse.json({ error: "Kayıt güncellenemedi", details: error?.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    await prisma.uretimTakipFoyu.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Kayıt silinemedi", details: error?.message }, { status: 500 })
  }
}
