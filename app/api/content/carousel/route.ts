import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const slides = await prisma.carouselSlide.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    })

    return NextResponse.json(slides)
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch carousel" }, { status: 500 })
  }
}
