import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { slug } = await params

    const body = (await req.json()) as { title?: string; content?: string }

    const existing = await prisma.legalContent.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const title = (body.title ?? existing.title).trim()
    const content = (body.content ?? existing.content).trim()

    if (!title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const updated = await prisma.legalContent.update({
      where: { slug },
      data: {
        title,
        content,
        lastUpdated: new Date().toISOString().split("T")[0],
      },
    })

    return NextResponse.json({ item: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update legal content" }, { status: 500 })
  }
}
