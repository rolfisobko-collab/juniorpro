import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import WebSocket from 'ws'

neonConfig.webSocketConstructor = WebSocket

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { image } = await request.json()

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'URL de imagen inválida' },
        { status: 400 }
      )
    }

    // Actualizar la imagen del producto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { 
        image: image,
        images: [image] // También actualizar el array de imágenes
      }
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product image:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar la imagen del producto' },
      { status: 500 }
    )
  }
}
