import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as { productId?: string; quantity?: number }
    const productId = body.productId
    const quantity = body.quantity ?? 1

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    if (!product.inStock) return NextResponse.json({ error: "Out of stock" }, { status: 409 })

    const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } })

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 })
  }
}
