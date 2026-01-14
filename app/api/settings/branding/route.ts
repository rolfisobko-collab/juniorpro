import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const branding = await prisma.brandingSetting.findFirst({
      orderBy: { id: "asc" },
    })

    if (!branding) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      siteName: branding.siteName,
      logoText: branding.logoText,
      logoImage: branding.logoImage,
      faviconImage: branding.faviconImage,
      primaryColor: branding.primaryColor,
      updatedAt: branding.updatedAt,
    })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch branding settings" }, { status: 500 })
  }
}
