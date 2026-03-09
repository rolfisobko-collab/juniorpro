import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, image, active } = body
    const updateData: { name?: string; slug?: string; image?: string | null; active?: boolean } = {}
    if (name !== undefined) { updateData.name = name.trim(); updateData.slug = slugify(name) }
    if (image !== undefined) updateData.image = image || null
    if (active !== undefined) updateData.active = active
    const brand = await prisma.brand.update({ where: { id }, data: updateData })
    revalidatePath("/")
    return NextResponse.json({ brand })
  } catch (e) {
    const err = e as any
    if (err?.code === "P2002") return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 })
    return NextResponse.json({ error: "Error updating brand" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.brand.delete({ where: { id } })
    revalidatePath("/")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error deleting brand" }, { status: 500 })
  }
}
