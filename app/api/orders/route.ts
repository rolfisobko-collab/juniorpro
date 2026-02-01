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
    const body = await req.json()
    
    // Intentar obtener usuario autenticado primero
    let user = null
    try {
      const userId = await requireUserId()
      if (userId) {
        user = await prisma.user.findUnique({
          where: { id: userId }
        })
      }
    } catch {
      // Si no hay autenticación, usar usuario por defecto para checkout
    }

    // Si no hay usuario autenticado, crear o usar usuario por defecto
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: "cliente@web.com" }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "cliente@web.com",
            name: "Cliente Web",
            passwordHash: "checkout-user-no-password",
          }
        })
      }
    }
    
    const orderData = {
      items: body.items || [],
      shippingMethod: body.shippingMethod || "retiro-local",
      shippingCost: body.shippingCost || 0,
      shippingAddress: body.shippingAddress || "Retiro en local",
      shippingCity: body.shippingCity || "",
      shippingDepartment: body.shippingDepartment || "",
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      total: body.total || 0,
      status: "pending",
      paymentMethod: body.paymentMethod || "pending",
      paymentStatus: body.paymentStatus || "pending"
    }

    // Crear orden con el usuario correspondiente
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: orderData.status,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingState: orderData.shippingDepartment,
        shippingZipCode: "0000",
        shippingMethod: orderData.shippingMethod,
        contactEmail: user.email,
        contactPhone: "+595 999 999 999",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: {
          create: orderData.items.map((item: any) => ({
            productId: item.productId,
            name: `Producto ${item.productId}`,
            image: "/placeholder.jpg",
            price: item.price,
            quantity: item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: orderData.status,
            note: user.email === "cliente@web.com" ? "Orden creada desde checkout web (no autenticado)" : "Orden creada desde checkout web",
          },
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
