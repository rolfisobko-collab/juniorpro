import { NextResponse, type NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { requireUserId } from "@/lib/auth-session"
import { getMirrorProductById } from "@/lib/mirror-products"

async function ensureOrderProduct(item: any) {
  const productId = String(item.productId || "")
  if (!productId) return

  const existing = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
  if (existing) return

  const mirrorProduct = productId.startsWith("mirror-") ? await getMirrorProductById(productId) : null
  const category = mirrorProduct?.category ?? {
    key: "general",
    name: "General",
    slug: "general",
    description: "Productos generales del catalogo.",
  }

  await prisma.category.upsert({
    where: { key: category.key },
    update: {
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
    },
    create: {
      key: category.key,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
    },
  })

  await prisma.product.create({
    data: {
      id: productId,
      codigo: mirrorProduct?.codigo ? String(mirrorProduct.codigo) : productId.replace(/^mirror-/, ""),
      name: mirrorProduct?.name || item.name || `Producto ${productId}`,
      categoryKey: category.key,
      price: Number(mirrorProduct?.price ?? item.price ?? 0),
      image: mirrorProduct?.image || item.image || "/placeholder.svg",
      images: Array.isArray(mirrorProduct?.images) ? mirrorProduct.images as string[] : [],
      description: mirrorProduct?.description || item.name || `Producto ${productId}`,
      brand: mirrorProduct?.brand || "Sin marca",
      rating: Number(mirrorProduct?.rating ?? 0),
      reviews: Number(mirrorProduct?.reviews ?? 0),
      inStock: true,
      stockQuantity: Number(mirrorProduct?.stockQuantity ?? 999999),
      featured: false,
      referencia: mirrorProduct?.referencia ? String(mirrorProduct.referencia) : null,
      codigoBarra: mirrorProduct?.codigoBarra ? String(mirrorProduct.codigoBarra) : null,
    },
  })
}

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
      contactPhone: body.contactPhone || "",
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      total: body.total || 0,
      status: "pending",
      paymentMethod: body.paymentMethod || "pending",
      paymentStatus: body.paymentStatus || "pending"
    }

    await Promise.all(orderData.items.map((item: any) => ensureOrderProduct(item)))

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
        contactPhone: orderData.contactPhone || user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: {
          create: orderData.items.map((item: any) => ({
            productId: item.productId,
            name: item.name || `Producto ${item.productId}`,
            image: item.image || "/placeholder.jpg",
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
