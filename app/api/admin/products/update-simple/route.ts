import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const id = body.id // Obtener ID del body en lugar de la URL
    
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    
    console.log('🔄 UPDATE SIMPLE - Updating product:', id, body)

    // Usar Prisma directamente para actualizar solo los campos necesarios
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.brand !== undefined) updateData.brand = body.brand
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = body.price
    if (body.categoryKey !== undefined) updateData.categoryKey = body.categoryKey
    if (body.image !== undefined) updateData.image = body.image
    if (body.images !== undefined) updateData.images = body.images
    if (body.inStock !== undefined) updateData.inStock = body.inStock
    if (body.weight !== undefined) updateData.weight = body.weight
    if (body.length !== undefined) updateData.length = body.length
    if (body.width !== undefined) updateData.width = body.width
    if (body.height !== undefined) updateData.height = body.height
    if (body.valorDeclarado !== undefined) updateData.valorDeclarado = body.valorDeclarado
    if (body.descripcionAduana !== undefined) updateData.descripcionAduana = body.descripcionAduana
    if (body.categoriaArancelaria !== undefined) updateData.categoriaArancelaria = body.categoriaArancelaria
    if (body.paisOrigen !== undefined) updateData.paisOrigen = body.paisOrigen
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }
    
    console.log('🔄 UPDATE SIMPLE - Updating with data:', updateData)
    
    await prisma.product.update({
      where: { id },
      data: updateData
    })

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
