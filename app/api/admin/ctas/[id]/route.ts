import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const body = (await req.json()) as Partial<{
      title: string
      description: string
      buttonText: string
      buttonLink: string
      imageDesktop: string
      imageMobile: string
      desktopWidth: number
      desktopHeight: number
      mobileWidth: number
      mobileHeight: number
      position: number
      isActive: boolean
      backgroundColor: string
      textColor: string
    }>

    const updated = await prisma.cta.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.buttonText !== undefined ? { buttonText: body.buttonText } : {}),
        ...(body.buttonLink !== undefined ? { buttonLink: body.buttonLink } : {}),
        ...(body.imageDesktop !== undefined ? { imageDesktop: body.imageDesktop } : {}),
        ...(body.imageMobile !== undefined ? { imageMobile: body.imageMobile } : {}),
        ...(typeof body.desktopWidth === "number" ? { desktopWidth: body.desktopWidth } : {}),
        ...(typeof body.desktopHeight === "number" ? { desktopHeight: body.desktopHeight } : {}),
        ...(typeof body.mobileWidth === "number" ? { mobileWidth: body.mobileWidth } : {}),
        ...(typeof body.mobileHeight === "number" ? { mobileHeight: body.mobileHeight } : {}),
        ...(typeof body.position === "number" ? { position: body.position } : {}),
        ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
        ...(body.backgroundColor !== undefined ? { backgroundColor: body.backgroundColor } : {}),
        ...(body.textColor !== undefined ? { textColor: body.textColor } : {}),
      },
    })

    return NextResponse.json({ cta: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update cta" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    await prisma.cta.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete cta" }, { status: 500 })
  }
}
