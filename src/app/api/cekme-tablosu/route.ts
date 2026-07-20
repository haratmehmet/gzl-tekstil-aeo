import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const records = await prisma.cekmeFoyu.findMany({
      include: {
        fabrics: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })
    return NextResponse.json(records)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, fabrics, createdAt, updatedAt, ...data } = body

    const newRecord = await prisma.cekmeFoyu.create({
      data: {
        ...data,
        fabrics: {
          create: fabrics?.map((f: any) => ({
            kullanildigiYer: f.kullanildigiYer || "",
            kumasIcerik: f.kumasIcerik || "",
            tedarikci: f.tedarikci || "",
            artikelAdi: f.artikelAdi || "",
            urunDptRenk: f.urunDptRenk || "",
            gelenMetraj: String(f.gelenMetraj || ""),
            kumasEn: String(f.kumasEn || ""),
            enCekmeYuzde: String(f.enCekmeYuzde || ""),
            boyCekmeYuzde: String(f.boyCekmeYuzde || ""),
          })) || [],
        },
      },
      include: {
        fabrics: true,
      },
    })

    return NextResponse.json(newRecord)
  } catch (error: any) {
    console.error("POST cekme-tablosu error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, fabrics, createdAt, updatedAt, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 })
    }

    await prisma.cekmeFabric.deleteMany({
      where: { cekmeFoyuId: id },
    })

    const updatedRecord = await prisma.cekmeFoyu.update({
      where: { id },
      data: {
        ...data,
        fabrics: {
          create: fabrics?.map((f: any) => ({
            kullanildigiYer: f.kullanildigiYer || "",
            kumasIcerik: f.kumasIcerik || "",
            tedarikci: f.tedarikci || "",
            artikelAdi: f.artikelAdi || "",
            urunDptRenk: f.urunDptRenk || "",
            gelenMetraj: String(f.gelenMetraj || ""),
            kumasEn: String(f.kumasEn || ""),
            enCekmeYuzde: String(f.enCekmeYuzde || ""),
            boyCekmeYuzde: String(f.boyCekmeYuzde || ""),
          })) || [],
        },
      },
      include: {
        fabrics: true,
      },
    })

    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    console.error("PUT cekme-tablosu error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await prisma.cekmeFoyu.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic';
