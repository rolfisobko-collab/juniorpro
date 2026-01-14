import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      include: { subcategories: { orderBy: { createdAt: "asc" } } },
    })

    return NextResponse.json({ categories })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as { name?: string; slug?: string; description?: string }

    const name = (body.name ?? "").trim()
    const slug = (body.slug ?? "").trim()
    const description = (body.description ?? "").trim()

    if (!name || !slug || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const created = await prisma.category.create({
      data: {
        key: slug,
        name,
        slug,
        description,
      },
      include: { subcategories: true },
    })

    return NextResponse.json({ category: created })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
