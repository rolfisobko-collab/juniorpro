import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { productId } = await params
    const body = (await req.json()) as { quantity?: number }
    const quantity = body.quantity

    if (typeof quantity !== "number") {
      return NextResponse.json({ error: "Missing quantity" }, { status: 400 })
    }

    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 })

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
      return NextResponse.json({ ok: true })
    }

    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { productId } = await params

    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) return NextResponse.json({ ok: true })

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}
