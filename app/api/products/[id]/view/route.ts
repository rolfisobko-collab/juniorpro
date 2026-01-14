import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = (await req.json().catch(() => ({}))) as { userId?: string; sessionId?: string }

    await prisma.productView.create({
      data: {
        productId: id,
        userId: body.userId ?? null,
        sessionId: body.sessionId ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 })
  }
}
