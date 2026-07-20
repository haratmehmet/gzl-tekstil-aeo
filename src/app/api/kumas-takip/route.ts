import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const records = await prisma.kumasTakip.findMany({
      include: {
        rolls: true,
      },
      orderBy: {
        createdAt: "desc",
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
    const { id, rolls, createdAt, updatedAt, ...data } = body

    console.log("POST kumas-takip payload:", { id, data, rolls })

    const newRecord = await prisma.kumasTakip.create({
      data: {
        ...data,
        gelenMetraj: Number(data.gelenMetraj) || 0,
        topAdedi: Number(data.topAdedi) || 0,
        rolls: {
          create: rolls?.map((r: any) => ({
            topUstundeYazanMt: Number(r.topUstundeYazanMt) || 0,
            cikanMt: r.cikanMt !== "" && r.cikanMt != null ? Number(r.cikanMt) : null,
            eksikFazlaMetraj: Number(r.eksikFazlaMetraj) || 0,
          })) || [],
        },
      },
      include: {
        rolls: true,
      },
    })

    // Sync to KalanKumas table automatically
    const formattedAmount = `${newRecord.gelenMetraj.toFixed(2).replace('.', ',')} ${newRecord.birim === 'KG' ? 'Kg' : 'Mt'}`
    const existingKalan = await prisma.kalanKumas.findFirst({
      where: { takipFoyuId: newRecord.id }
    })

    if (existingKalan) {
      await prisma.kalanKumas.update({
        where: { id: existingKalan.id },
        data: {
          kumasKodu: newRecord.kumasKodu || "",
          depoyaGirisTarihi: newRecord.geldigiTarih || "",
          kumasMetraji: formattedAmount
        }
      })
    } else {
      await prisma.kalanKumas.create({
        data: {
          faturaNo: "",
          malzemeKodu: "",
          faturaTarih: "",
          depoyaGirisTarihi: newRecord.geldigiTarih || "",
          kumasKodu: newRecord.kumasKodu || "",
          kumasMetraji: formattedAmount,
          takipFoyuId: newRecord.id
        }
      })
    }

    // Sync to KumasDeposu table automatically
    const existingDepo = await prisma.kumasDeposu.findFirst({
      where: { takipFoyuId: newRecord.id },
      orderBy: { eklenmeTarihi: 'asc' }
    })

    if (existingDepo) {
      await prisma.kumasDeposu.update({
        where: { id: existingDepo.id },
        data: {
          tarih: newRecord.geldigiTarih || "",
          renk: newRecord.kumasRenk || "",
          firma: newRecord.kumasciFirma || "",
          sezon: newRecord.sezon || "",
          kumasKodu: newRecord.kumasKodu || "",
          gelenMetraj: formattedAmount,
          baglananModel: `${newRecord.baglandigiModel || ""} - ${newRecord.kullanildigiYer || ""}`.trim().replace(/^-|-$/g, "").trim()
        }
      })
    } else {
      await prisma.kumasDeposu.create({
        data: {
          tarih: newRecord.geldigiTarih || "",
          renk: newRecord.kumasRenk || "",
          firma: newRecord.kumasciFirma || "",
          sezon: newRecord.sezon || "",
          kumasKodu: newRecord.kumasKodu || "",
          gelenMetraj: formattedAmount,
          kesimTarihi: "",
          baglananModel: `${newRecord.baglandigiModel || ""} - ${newRecord.kullanildigiYer || ""}`.trim().replace(/^-|-$/g, "").trim(),
          kesilenAdet: "",
          aciklama: "",
          harcananMetraj: "",
          netMetraj: formattedAmount,
          takipFoyuId: newRecord.id
        }
      })
    }

    return NextResponse.json(newRecord)
  } catch (error: any) {
    console.error("POST kumas-takip error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, rolls, createdAt, updatedAt, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 })
    }

    // Since rolls might change completely, it's easiest to delete old ones and recreate
    await prisma.roll.deleteMany({
      where: { kumasTakipId: id },
    })

    const updatedRecord = await prisma.kumasTakip.update({
      where: { id },
      data: {
        ...data,
        gelenMetraj: Number(data.gelenMetraj) || 0,
        topAdedi: Number(data.topAdedi) || 0,
        rolls: {
          create: rolls?.map((r: any) => ({
            topUstundeYazanMt: Number(r.topUstundeYazanMt) || 0,
            cikanMt: r.cikanMt !== "" && r.cikanMt != null ? Number(r.cikanMt) : null,
            eksikFazlaMetraj: Number(r.eksikFazlaMetraj) || 0,
          })) || [],
        },
      },
      include: {
        rolls: true,
      },
    })

    // Sync to KalanKumas table automatically
    const formattedAmount = `${updatedRecord.gelenMetraj.toFixed(2).replace('.', ',')} ${updatedRecord.birim === 'KG' ? 'Kg' : 'Mt'}`
    const existingKalan = await prisma.kalanKumas.findFirst({
      where: { takipFoyuId: updatedRecord.id }
    })

    if (existingKalan) {
      await prisma.kalanKumas.update({
        where: { id: existingKalan.id },
        data: {
          kumasKodu: updatedRecord.kumasKodu || "",
          depoyaGirisTarihi: updatedRecord.geldigiTarih || "",
          kumasMetraji: formattedAmount
        }
      })
    } else {
      await prisma.kalanKumas.create({
        data: {
          faturaNo: "",
          malzemeKodu: "",
          faturaTarih: "",
          depoyaGirisTarihi: updatedRecord.geldigiTarih || "",
          kumasKodu: updatedRecord.kumasKodu || "",
          kumasMetraji: formattedAmount,
          takipFoyuId: updatedRecord.id
        }
      })
    }

    // Sync to KumasDeposu table automatically
    const existingDepo = await prisma.kumasDeposu.findFirst({
      where: { takipFoyuId: updatedRecord.id },
      orderBy: { eklenmeTarihi: 'asc' }
    })

    if (existingDepo) {
      await prisma.kumasDeposu.update({
        where: { id: existingDepo.id },
        data: {
          tarih: updatedRecord.geldigiTarih || "",
          renk: updatedRecord.kumasRenk || "",
          firma: updatedRecord.kumasciFirma || "",
          sezon: updatedRecord.sezon || "",
          kumasKodu: updatedRecord.kumasKodu || "",
          gelenMetraj: formattedAmount,
          baglananModel: `${updatedRecord.baglandigiModel || ""} - ${updatedRecord.kullanildigiYer || ""}`.trim().replace(/^-|-$/g, "").trim()
        }
      })
    } else {
      await prisma.kumasDeposu.create({
        data: {
          tarih: updatedRecord.geldigiTarih || "",
          renk: updatedRecord.kumasRenk || "",
          firma: updatedRecord.kumasciFirma || "",
          sezon: updatedRecord.sezon || "",
          kumasKodu: updatedRecord.kumasKodu || "",
          gelenMetraj: formattedAmount,
          kesimTarihi: "",
          baglananModel: `${updatedRecord.baglandigiModel || ""} - ${updatedRecord.kullanildigiYer || ""}`.trim().replace(/^-|-$/g, "").trim(),
          kesilenAdet: "",
          aciklama: "",
          harcananMetraj: "",
          netMetraj: formattedAmount,
          takipFoyuId: updatedRecord.id
        }
      })
    }

    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    console.error("PUT kumas-takip error:", error)
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

    // Fetch the tracking record first to get its matching fields for CekmeFoyu
    const record = await prisma.kumasTakip.findUnique({
      where: { id }
    })

    // Deleting linked KalanKumas entries
    await prisma.kalanKumas.deleteMany({
      where: { takipFoyuId: id },
    })

    if (record) {
      // Deleting linked CekmeFoyu entries by matching fabric code, model code, and season
      await prisma.cekmeFoyu.deleteMany({
        where: {
          kumasKodu: record.kumasKodu,
          modelKodu: record.baglandigiModel,
          sezon: record.sezon,
        },
      })
    }

    await prisma.kumasTakip.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic';
