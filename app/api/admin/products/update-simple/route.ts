import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const id = body.id // Obtener ID del body en lugar de la URL
    
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    
    console.log('🔄 UPDATE SIMPLE - Updating product:', id, body)

    // Usar SQL directo para evitar problemas con weight
    await prisma.$executeRaw`
      UPDATE "Product" 
      SET 
        name = ${body.name},
        brand = ${body.brand},
        description = ${body.description},
        price = ${body.price},
        "categoryKey" = ${body.categoryKey},
        image = ${body.image},
        images = ${body.images || []},
        "inStock" = ${body.inStock ?? true},
        weight = ${body.weight ?? 0.5},
        length = ${body.length ?? 20},
        width = ${body.width ?? 15},
        height = ${body.height ?? 10},
        "valorDeclarado" = ${body.valorDeclarado || null},
        "descripcionAduana" = ${body.descripcionAduana || null},
        "categoriaArancelaria" = ${body.categoriaArancelaria || null},
        "paisOrigen" = ${body.paisOrigen || null},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    // Obtener el producto actualizado
    const updatedProduct = await prisma.$queryRaw`
      SELECT id, name, brand, price, "categoryKey", image, images, description, rating, reviews, "inStock"
      FROM "Product" 
      WHERE id = ${id}
    ` as any[]

    console.log('✅ Product updated successfully')
    return NextResponse.json({ product: updatedProduct[0] })
  } catch (error) {
    console.error('❌ UPDATE SIMPLE - Error:', error)
    return NextResponse.json({ 
      error: "Failed to update product",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
