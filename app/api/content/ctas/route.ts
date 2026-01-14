import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const ctas = await prisma.cta.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    })

    return NextResponse.json(ctas)
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch ctas" }, { status: 500 })
  }
}
