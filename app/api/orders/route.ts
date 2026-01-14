import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"

export async function GET() {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })

    return NextResponse.json({ orders })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as {
      shipping?: {
        address?: string
        city?: string
        state?: string
        zipCode?: string
        method?: string
      }
      contact?: { email?: string; phone?: string }
      note?: string
    }

    const shipping = body.shipping
    const contact = body.contact

    if (!shipping?.address || !shipping.city || !shipping.state || !shipping.zipCode || !shipping.method) {
      return NextResponse.json({ error: "Missing shipping fields" }, { status: 400 })
    }
    if (!contact?.email || !contact.phone) {
      return NextResponse.json({ error: "Missing contact fields" }, { status: 400 })
    }

    const shippingAddress = shipping.address
    const shippingCity = shipping.city
    const shippingState = shipping.state
    const shippingZipCode = shipping.zipCode
    const shippingMethod = shipping.method
    const contactEmail = contact.email
    const contactPhone = contact.phone

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 409 })
    }

    const now = new Date()

    const created = await prisma.$transaction(async (tx) => {
      // stock validation
      for (const item of cart.items) {
        if (!item.product.inStock || item.product.stockQuantity < item.quantity) {
          throw new Error(`OUT_OF_STOCK:${item.productId}`)
        }
      }

      const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

      const order = await tx.order.create({
        data: {
          userId,
          status: "processing",
          total,
          shippingAddress: shippingAddress,
          shippingCity: shippingCity,
          shippingState: shippingState,
          shippingZipCode: shippingZipCode,
          shippingMethod: shippingMethod,
          contactEmail: contactEmail,
          contactPhone: contactPhone,
          createdAt: now,
          updatedAt: now,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              name: i.product.name,
              image: i.product.image,
              price: i.product.price,
              quantity: i.quantity,
            })),
          },
          statusHistory: {
            create: {
              status: "processing",
              note: body.note ?? null,
            },
          },
        },
        include: { items: true },
      })

      for (const item of cart.items) {
        const newStock = item.product.stockQuantity - item.quantity
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newStock,
            inStock: newStock > 0,
          },
        })
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return order
    })

    return NextResponse.json({ order: created })
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    if (msg.startsWith("OUT_OF_STOCK:")) {
      return NextResponse.json({ error: "Out of stock", productId: msg.replace("OUT_OF_STOCK:", "") }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
