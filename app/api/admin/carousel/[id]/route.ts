import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: idParam } = await params
    const id = Number.parseInt(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const body = (await req.json()) as Partial<{
      title: string
      subtitle: string
      description: string
      buttonText: string
      buttonLink: string
      image: string
      imageMobile: string
      backgroundColor: string
      textColor: string
      position: number
      isActive: boolean
    }>

    const updated = await prisma.carouselSlide.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.buttonText !== undefined ? { buttonText: body.buttonText } : {}),
        ...(body.buttonLink !== undefined ? { buttonLink: body.buttonLink } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(body.imageMobile !== undefined ? { imageMobile: body.imageMobile } : {}),
        ...(body.backgroundColor !== undefined ? { backgroundColor: body.backgroundColor } : {}),
        ...(body.textColor !== undefined ? { textColor: body.textColor } : {}),
        ...(typeof body.position === "number" ? { position: body.position } : {}),
        ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
      },
    })

    return NextResponse.json({ slide: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update slide" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: idParam } = await params
    const id = Number.parseInt(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    await prisma.carouselSlide.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 })
  }
}
