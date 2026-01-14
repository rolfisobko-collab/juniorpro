import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { key } = await params

    const body = (await req.json()) as { name?: string; slug?: string; id?: string }

    const name = (body.name ?? "").trim()
    const slug = (body.slug ?? "").trim()

    if (!name || !slug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const category = await prisma.category.findUnique({ where: { key } })
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 })

    const id = (body.id ?? `${category.key}-${slug}`).trim()

    const created = await prisma.subCategory.create({
      data: {
        id,
        name,
        slug,
        categoryKey: category.key,
      },
    })

    return NextResponse.json({ subcategory: created })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 })
  }
}
