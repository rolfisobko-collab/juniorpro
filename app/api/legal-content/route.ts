import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const items = await prisma.legalContent.findMany({
      orderBy: { slug: "asc" },
    })

    return NextResponse.json(items)
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch legal content" }, { status: 500 })
  }
}
