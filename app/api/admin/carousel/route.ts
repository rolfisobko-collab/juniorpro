import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const slides = await prisma.carouselSlide.findMany({ orderBy: { position: "asc" } })
    return NextResponse.json({ slides })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load slides" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as {
      title?: string
      subtitle?: string
      description?: string
      buttonText?: string
      buttonLink?: string
      image?: string
      imageMobile?: string
      backgroundColor?: string
      textColor?: string
      isActive?: boolean
    }

    if (
      !body.title ||
      !body.subtitle ||
      !body.description ||
      !body.buttonText ||
      !body.buttonLink ||
      !body.image ||
      !body.imageMobile ||
      !body.backgroundColor ||
      !body.textColor
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const agg = await prisma.carouselSlide.aggregate({ _max: { id: true, position: true } })
    const nextId = (agg._max.id ?? 0) + 1
    const nextPos = (agg._max.position ?? 0) + 1

    const created = await prisma.carouselSlide.create({
      data: {
        id: nextId,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        buttonText: body.buttonText,
        buttonLink: body.buttonLink,
        image: body.image,
        imageMobile: body.imageMobile,
        backgroundColor: body.backgroundColor,
        textColor: body.textColor,
        position: nextPos,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json({ slide: created })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create slide" }, { status: 500 })
  }
}
