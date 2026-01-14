import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as {
      siteName?: string
      logoText?: string
      logoImage?: string | null
      faviconImage?: string | null
      primaryColor?: string | null
    }

    const existing = await prisma.brandingSetting.findFirst({ orderBy: { id: "asc" } })
    if (!existing) return NextResponse.json({ error: "Branding not found" }, { status: 404 })

    const updated = await prisma.brandingSetting.update({
      where: { id: existing.id },
      data: {
        ...(body.siteName !== undefined ? { siteName: body.siteName } : {}),
        ...(body.logoText !== undefined ? { logoText: body.logoText } : {}),
        ...(body.logoImage !== undefined ? { logoImage: body.logoImage ?? null } : {}),
        ...(body.faviconImage !== undefined ? { faviconImage: body.faviconImage ?? null } : {}),
        ...(body.primaryColor !== undefined ? { primaryColor: body.primaryColor ?? null } : {}),
        updatedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ branding: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update branding settings" }, { status: 500 })
  }
}
