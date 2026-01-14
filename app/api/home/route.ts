import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const [carouselSlides, ctas, homeCategories] = await Promise.all([
      prisma.carouselSlide.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
      prisma.cta.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
      prisma.homeCategory.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    ])

    return NextResponse.json({ carouselSlides, ctas, homeCategories })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch home content" }, { status: 500 })
  }
}
