import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const body = (await req.json()) as { name?: string; slug?: string }

    const existing = await prisma.subCategory.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const name = body.name !== undefined ? body.name.trim() : existing.name
    const slug = body.slug !== undefined ? body.slug.trim() : existing.slug

    if (!name || !slug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const updated = await prisma.subCategory.update({ where: { id: existing.id }, data: { name, slug } })

    return NextResponse.json({ subcategory: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    await prisma.subCategory.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 })
  }
}
