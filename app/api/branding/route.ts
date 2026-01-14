import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const branding = await prisma.brandingSetting.findFirst({
      orderBy: { id: "asc" },
    })

    return NextResponse.json(branding)
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 })
  }
}
