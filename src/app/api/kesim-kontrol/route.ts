import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const records = await prisma.kesimKontrolFoyu.findMany({
      orderBy: { eklenmeTarihi: "desc" },
    })
    
    // Parse JSON fields
    const parsedRecords = records.map((r) => ({
      ...r,
      kumaslar: r.kumaslar ? (typeof r.kumaslar === "string" ? JSON.parse(r.kumaslar) : r.kumaslar) : [],
      bedenler: r.bedenler ? (typeof r.bedenler === "string" ? JSON.parse(r.bedenler) : r.bedenler) : [],
    }))

    return NextResponse.json(parsedRecords)
  } catch (error) {
    console.error("GET Kesim Kontrol Hatası:", error)
    return NextResponse.json({ error: "Veriler alınamadı" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { kumaslar, bedenler, ...rest } = data

    const newRecord = await prisma.kesimKontrolFoyu.create({
      data: {
        ...rest,
        kumaslar: kumaslar || [],
        bedenler: bedenler || [],
      },
    })

    return NextResponse.json({
      ...newRecord,
      kumaslar: kumaslar || [],
      bedenler: bedenler || [],
    })
  } catch (error: any) {
    console.error("POST Kesim Kontrol Hatası:", error)
    return NextResponse.json({ error: "Kayıt oluşturulamadı", details: error?.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic';
