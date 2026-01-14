import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: NextRequest, context: { params: any }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { key } = (await Promise.resolve(context.params)) as { key: string }

    const body = (await req.json()) as { name?: string; slug?: string; description?: string }

    const existing = await prisma.category.findUnique({ where: { key } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const nextName = body.name !== undefined ? body.name.trim() : existing.name
    const nextSlug = body.slug !== undefined ? body.slug.trim() : existing.slug
    const nextDesc = body.description !== undefined ? body.description.trim() : existing.description ?? ""

    if (!nextName || !nextSlug || !nextDesc) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // If slug changes, migrate primary key (key) by creating new Category and moving relations.
    if (nextSlug !== existing.slug) {
      const updated = await prisma.$transaction(async (tx) => {
        const created = await tx.category.create({
          data: {
            key: nextSlug,
            name: nextName,
            slug: nextSlug,
            description: nextDesc,
          },
        })

        await tx.product.updateMany({ where: { categoryKey: existing.key }, data: { categoryKey: created.key } })
        await tx.subCategory.updateMany({ where: { categoryKey: existing.key }, data: { categoryKey: created.key } })

        await tx.category.delete({ where: { key: existing.key } })

        return tx.category.findUnique({ where: { key: created.key }, include: { subcategories: true } })
      })

      return NextResponse.json({ category: updated })
    }

    const updated = await prisma.category.update({
      where: { key: existing.key },
      data: {
        name: nextName,
        slug: nextSlug,
        description: nextDesc,
      },
      include: { subcategories: true },
    })

    return NextResponse.json({ category: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: { params: any }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { key } = (await Promise.resolve(context.params)) as { key: string }

    await prisma.category.delete({ where: { key } })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
