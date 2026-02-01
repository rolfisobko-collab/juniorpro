import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Mock products for when database is not available
const MOCK_PRODUCTS = [
  {
    id: "db-1",
    name: "iPhone 15 Pro Max - Base de Datos",
    categoryKey: "electronics",
    price: 1299,
    image: "/iphone-15-pro-max-premium-smartphone.jpg",
    description: "El smartphone más avanzado con chip A17 Pro y cámara profesional (Desde BD)",
    brand: "Apple",
    rating: 4.9,
    reviews: 1234,
    inStock: true,
    stockQuantity: 25,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      key: "electronics",
      name: "Electrónica",
      slug: "electronics",
      description: "Productos electrónicos modernos"
    }
  },
  {
    id: "db-2",
    name: "MacBook Pro 16\" - Base de Datos",
    categoryKey: "electronics",
    price: 2599,
    image: "/macbook-pro-16-inch-laptop-premium.jpg",
    description: "Potencia extrema con chip M3 Max para profesionales creativos (Desde BD)",
    brand: "Apple",
    rating: 4.8,
    reviews: 987,
    inStock: true,
    stockQuantity: 15,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      key: "electronics",
      name: "Electrónica",
      slug: "electronics",
      description: "Productos electrónicos modernos"
    }
  },
  {
    id: "db-3",
    name: "Sony WH-1000XM5 - Base de Datos",
    categoryKey: "electronics",
    price: 429,
    image: "/sony-premium-noise-cancelling-headphones.jpg",
    description: "Auriculares premium con cancelación de ruido líder en la industria (Desde BD)",
    brand: "Sony",
    rating: 4.7,
    reviews: 2341,
    inStock: true,
    stockQuantity: 30,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      key: "electronics",
      name: "Electrónica",
      slug: "electronics",
      description: "Productos electrónicos modernos"
    }
  },
  {
    id: "db-4",
    name: "Samsung OLED 4K 65\" - Base de Datos",
    categoryKey: "appliances",
    price: 1999,
    image: "/samsung-oled-tv-65-inch-premium.jpg",
    description: "Televisor OLED 4K con calidad de imagen cinematográfica (Desde BD)",
    brand: "Samsung",
    rating: 4.9,
    reviews: 543,
    inStock: true,
    stockQuantity: 8,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      key: "appliances",
      name: "Electrodomésticos",
      slug: "appliances",
      description: "Electrodomésticos modernos"
    }
  },
  {
    id: "db-5",
    name: "Chanel N°5 - Base de Datos",
    categoryKey: "perfumes",
    price: 179,
    image: "/chanel-no-5-perfume-bottle-luxury.jpg",
    description: "El perfume icónico que define la elegancia atemporal (Desde BD)",
    brand: "Chanel",
    rating: 4.9,
    reviews: 3421,
    inStock: true,
    stockQuantity: 20,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      key: "perfumes",
      name: "Perfumes",
      slug: "perfumes",
      description: "Fragancias de lujo"
    }
  }
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort")
    const search = (searchParams.get("search") ?? "").trim()

    // Build where clause
    const where: any = {}
    
    if (category && category !== "all") {
      where.categoryKey = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } }
      ]
    }

    if (minPrice) {
      where.price = { ...where.price, gte: Number(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: Number(maxPrice) }
    }

    // Build order by clause
    let orderBy: any[] = [{ featured: "desc" }, { name: "asc" }]
    
    switch (sort) {
      case "price_asc":
        orderBy = [{ price: "asc" }]
        break
      case "price_desc":
        orderBy = [{ price: "desc" }]
        break
      case "rating_desc":
        orderBy = [{ rating: "desc" }]
        break
      case "latest":
        orderBy = [{ createdAt: "desc" }]
        break
    }

    // Get products with categories
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              key: true,
              name: true,
              slug: true,
              description: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({ 
      products: products.map(product => ({
        ...product,
        stockQuantity: product.stockQuantity || 0
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      fromMock: false
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    )
  }
}

function parseSort(sort: string | null): { [key: string]: "asc" | "desc" }[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }]
    case "price_desc":
      return [{ price: "desc" }]
    case "rating_desc":
      return [{ rating: "desc" }]
    case "latest":
      return [{ createdAt: "desc" }]
    default:
      return [{ featured: "desc" }, { name: "asc" }]
  }
}
