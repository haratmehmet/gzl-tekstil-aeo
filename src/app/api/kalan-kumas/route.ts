import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const records = await prisma.kalanKumas.findMany({
      orderBy: {
        depoyaGirisTarihi: "desc",
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
    const { id, eklenmeTarihi, updatedAt, ...data } = body

    const newRecord = await prisma.kalanKumas.create({
      data: {
        ...data,
      },
    })

    return NextResponse.json(newRecord)
  } catch (error: any) {
    console.error("POST kalan-kumas error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, eklenmeTarihi, updatedAt, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 })
    }

    const updatedRecord = await prisma.kalanKumas.update({
      where: { id },
      data: {
        ...data,
      },
    })

    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    console.error("PUT kalan-kumas error:", error)
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

    await prisma.kalanKumas.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
