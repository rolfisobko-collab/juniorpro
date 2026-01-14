import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const item = await prisma.legalContent.findUnique({
      where: { slug },
    })

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch legal content" }, { status: 500 })
  }
}
