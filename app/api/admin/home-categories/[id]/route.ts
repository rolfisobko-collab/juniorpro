import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const body = (await req.json()) as Partial<{ name: string; image: string; link: string; active: boolean; order: number }>

    const updated = await prisma.homeCategory.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(body.link !== undefined ? { link: body.link } : {}),
        ...(typeof body.active === "boolean" ? { active: body.active } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
    })

    return NextResponse.json({ category: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update home category" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    await prisma.homeCategory.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete home category" }, { status: 500 })
  }
}
