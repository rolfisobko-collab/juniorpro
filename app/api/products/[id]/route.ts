import { NextResponse, type NextRequest } from "next/server"

// Mock products
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Try to get from database first
    try {
      const { prisma } = await import("@/lib/db")
      
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true }
      })

      if (product) {
        return NextResponse.json({ product, fromMock: false }, {
          headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" }
        })
      }
    } catch (dbError) {
      console.warn("Database not available, using mock products:", dbError)
    }

    // Fallback to mock data
    const product = MOCK_PRODUCTS.find(p => p.id === id)
    
    if (product) {
      return NextResponse.json({ product, fromMock: true })
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
