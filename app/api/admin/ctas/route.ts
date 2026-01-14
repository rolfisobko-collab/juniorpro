import { NextResponse } from "next/server"
import crypto from "crypto"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ctas = await prisma.cta.findMany({ orderBy: { position: "asc" } })
    return NextResponse.json({ ctas })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load ctas" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as {
      title?: string
      description?: string
      buttonText?: string
      buttonLink?: string
      imageDesktop?: string
      imageMobile?: string
      desktopWidth?: number
      desktopHeight?: number
      mobileWidth?: number
      mobileHeight?: number
      position?: number
      isActive?: boolean
      backgroundColor?: string
      textColor?: string
    }

    if (
      !body.title ||
      !body.description ||
      !body.buttonText ||
      !body.buttonLink ||
      !body.imageDesktop ||
      !body.imageMobile ||
      typeof body.desktopWidth !== "number" ||
      typeof body.desktopHeight !== "number" ||
      typeof body.mobileWidth !== "number" ||
      typeof body.mobileHeight !== "number" ||
      !body.backgroundColor ||
      !body.textColor
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const agg = await prisma.cta.aggregate({ _max: { position: true } })
    const nextPos = body.position ?? (agg._max.position ?? 0) + 1

    const created = await prisma.cta.create({
      data: {
        id: crypto.randomUUID(),
        title: body.title,
        description: body.description,
        buttonText: body.buttonText,
        buttonLink: body.buttonLink,
        imageDesktop: body.imageDesktop,
        imageMobile: body.imageMobile,
        desktopWidth: body.desktopWidth,
        desktopHeight: body.desktopHeight,
        mobileWidth: body.mobileWidth,
        mobileHeight: body.mobileHeight,
        position: nextPos,
        isActive: body.isActive ?? true,
        backgroundColor: body.backgroundColor,
        textColor: body.textColor,
      },
    })

    return NextResponse.json({ cta: created })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create cta" }, { status: 500 })
  }
}
