import { NextResponse } from "next/server"
import crypto from "crypto"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"
import type { Prisma } from "@prisma/client"
import { getMirrorProducts, isMirrorCatalogEnabled } from "@/lib/mirror-products"

export async function GET(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = (searchParams.get("search") ?? "").trim()
    const categoryKey = (searchParams.get("category") ?? "").trim()
    const noImage = searchParams.get("noImage") === "true"
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "100", 10)))
    const skip = (page - 1) * pageSize

    if (isMirrorCatalogEnabled()) {
      const allProducts: any[] = []
      let mirrorPage = 1
      let mirrorTotalPages = 1

      do {
        const result = await getMirrorProducts({
          page: mirrorPage,
          limit: 100,
          search,
          category: categoryKey || undefined,
        })
        allProducts.push(...result.products)
        mirrorTotalPages = Math.max(1, Math.ceil(result.total / result.limit))
        mirrorPage++
      } while (mirrorPage <= mirrorTotalPages)

      const withoutImage = allProducts.filter(product => !product.image || !String(product.image).startsWith("http"))
      const filtered = noImage ? withoutImage : allProducts

      return NextResponse.json({
        products: filtered.slice(skip, skip + pageSize),
        total: filtered.length,
        totalWithoutImage: withoutImage.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        source: "techzone_mirror",
      })
    }

    const baseWhere: Prisma.ProductWhereInput = {
      ...(categoryKey ? { categoryKey } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { brand: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    // Products "without image" have /placeholder-*.jpg paths, not empty strings.
    // Filter: image does not start with "http"
    const noImageCondition: Prisma.ProductWhereInput = {
      NOT: { image: { startsWith: "http" } },
    }

    const where: Prisma.ProductWhereInput = noImage
      ? { AND: [baseWhere, noImageCondition] }
      : baseWhere

    const whereWithoutImage: Prisma.ProductWhereInput = { AND: [baseWhere, noImageCondition] }

    const [products, total, totalWithoutImage] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          price: true,
          brand: true,
          categoryKey: true,
          description: true,
          image: true,
          images: true,
          rating: true,
          reviews: true,
          inStock: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
      prisma.product.count({ where: whereWithoutImage }),
    ])

    return NextResponse.json({
      products,
      total,
      totalWithoutImage,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error("❌ Error in GET /api/admin/products:", error)
    return NextResponse.json({
      error: "Failed to load products",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    console.log('🔍 POST /api/admin/products - Starting request')
    
    const adminId = await requireAdminId()
    console.log('👤 Admin ID:', adminId)
    
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as {
      name?: string
      brand?: string
      description?: string
      price?: number
      categoryKey?: string
      image?: string
      inStock?: boolean
      stockQuantity?: number
      featured?: boolean
    }

    console.log('📦 Product data received:', body)

    if (!body.name || !body.brand || !body.description || typeof body.price !== "number" || !body.categoryKey || !body.image) {
      console.log('❌ Missing fields validation failed:', {
        name: !!body.name,
        brand: !!body.brand,
        description: !!body.description,
        price: typeof body.price === "number",
        categoryKey: !!body.categoryKey,
        image: !!body.image
      })
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    console.log('💾 Creating product in database...')
    // Crear el objeto sin incluir el campo weight
    const productDataWithoutWeight = {
      id: crypto.randomUUID(),
      name: body.name,
      brand: body.brand,
      description: body.description,
      price: body.price,
      categoryKey: body.categoryKey,
      image: body.image,
      rating: 0,
      reviews: 0,
      inStock: body.inStock ?? (body.stockQuantity ?? 0) > 0,
      stockQuantity: body.stockQuantity ?? (body.inStock ? 50 : 0),
      featured: body.featured ?? false,
    }
    
    const created = await prisma.product.create({
      data: productDataWithoutWeight,
    })

    console.log('✅ Product created successfully:', created.id)
    return NextResponse.json({ product: created })
  } catch (error) {
    console.error('❌ Error in POST /api/admin/products:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({ 
      error: "Failed to create product",
      message: errorMessage,
      stack: errorStack
    }, { status: 500 })
  }
}
