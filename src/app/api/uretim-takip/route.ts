import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireMutationAuth } from "@/lib/session"

export async function GET() {
  try {
    const records = await prisma.uretimTakipFoyu.findMany({
      orderBy: { eklenmeTarihi: "desc" },
    })
    return NextResponse.json(records.map(r => ({
      ...r,
      bedenler: r.bedenler ?? [],
    })))
  } catch (error: any) {
    console.error("GET Ürün Takip Hatası:", error)
    return NextResponse.json({ error: "Kayıtlar getirilemedi", details: error?.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireMutationAuth();
    const { bedenler, ...rest } = await req.json()
    const newRecord = await prisma.uretimTakipFoyu.create({
      data: { ...rest, bedenler: bedenler || [] },
    })
    return NextResponse.json({ ...newRecord, bedenler: newRecord.bedenler ?? [] })
  } catch (error: any) {
    console.error("POST Ürün Takip Hatası:", error)
    return NextResponse.json({ error: "Kayıt oluşturulamadı", details: error?.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic';
