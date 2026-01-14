import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const items = await prisma.homeCategory.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(items)
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch home categories" }, { status: 500 })
  }
}
