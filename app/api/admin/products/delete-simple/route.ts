import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body
    
    if (!id) {
      console.error('❌ DELETE SIMPLE - Missing product ID')
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    }

    console.log('🗑️ DELETE SIMPLE - Deleting product:', id)

    // Verificar que el producto existe
    const product = await prisma.$queryRaw`
      SELECT id FROM "Product" WHERE id = ${id}
    `

    if (!product || (product as any[]).length === 0) {
      console.error('❌ DELETE SIMPLE - Product not found:', id)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Eliminar primero las relaciones (OrderItems) antes que el producto
    console.log('🗑️ Deleting OrderItems for product:', id)
    await prisma.$executeRaw`
      DELETE FROM "OrderItem" WHERE "productId" = ${id}
    `

    // Eliminar el producto
    console.log('🗑️ Deleting Product:', id)
    await prisma.$executeRaw`
      DELETE FROM "Product" WHERE id = ${id}
    `

    console.log('✅ Product and relations deleted successfully:', id)
    return NextResponse.json({ success: true, message: "Product deleted successfully" })

  } catch (error) {
    console.error('❌ DELETE SIMPLE - Error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: "Failed to delete product",
      message: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 })
  }
}
