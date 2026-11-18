import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireMutationAuth } from "@/lib/session"

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
    const roleOrder: Record<string, number> = { "ANA KUMAŞ": 0, "ASTAR": 1, "GARNİ": 2 }
    const normalized = records.map(r => ({
      ...r,
      fabrics: [...r.fabrics].sort((a, b) => {
        const orderA = roleOrder[a.kullanildigiYer?.trim().toUpperCase()] ?? 3
        const orderB = roleOrder[b.kullanildigiYer?.trim().toUpperCase()] ?? 3
        return orderA - orderB
      })
    }))
    return NextResponse.json(normalized)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireMutationAuth();
    const body = await request.json()
    const { id, fabrics, createdAt, updatedAt, ...data } = body

    const newRecord = await prisma.cekmeFoyu.create({
      data: {
        ...data,
        fabrics: {
          create: fabrics?.map((f: any) => ({
            kullanildigiYer: f.kullanildigiYer || "",
            kumasKodu: f.kumasKodu || "",
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
    await requireMutationAuth();
    const body = await request.json()
    const { id, fabrics, createdAt, updatedAt, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 })
    }

    const updatedRecord = await prisma.$transaction(async (tx) => {
      await tx.cekmeFabric.deleteMany({
        where: { cekmeFoyuId: id },
      })

      return await tx.cekmeFoyu.update({
        where: { id },
        data: {
          ...data,
          fabrics: {
            create: fabrics?.map((f: any) => ({
              kullanildigiYer: f.kullanildigiYer || "",
              kumasKodu: f.kumasKodu || "",
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
    })

    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    console.error("PUT cekme-tablosu error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireMutationAuth();
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
