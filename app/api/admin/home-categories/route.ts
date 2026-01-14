import { NextResponse } from "next/server"
import crypto from "crypto"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const categories = await prisma.homeCategory.findMany({ orderBy: { order: "asc" } })
    return NextResponse.json({ categories })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load home categories" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as { name?: string; image?: string; link?: string; active?: boolean; order?: number }

    const name = (body.name ?? "").trim()
    const image = (body.image ?? "").trim()
    const link = (body.link ?? "").trim()

    if (!name || !image || !link) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const agg = await prisma.homeCategory.aggregate({ _max: { order: true } })
    const nextOrder = body.order ?? (agg._max.order ?? 0) + 1

    const created = await prisma.homeCategory.create({
      data: {
        id: crypto.randomUUID(),
        name,
        image,
        link,
        active: body.active ?? true,
        order: nextOrder,
      },
    })

    return NextResponse.json({ category: created })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create home category" }, { status: 500 })
  }
}
