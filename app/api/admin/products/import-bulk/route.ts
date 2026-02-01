import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function POST(req: Request) {
  try {
    console.log('🔄 BULK IMPORT - Starting import')
    
    const adminId = await requireAdminId()
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { products, confirmUpdate } = body

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 })
    }

    console.log(`📦 Processing ${products.length} products (confirmUpdate: ${confirmUpdate})`)

    let imported = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []
    const duplicates: any[] = [] // Para mostrar productos duplicados

    // Si no se confirma la actualización, primero identificar duplicados
    if (!confirmUpdate) {
      for (const product of products) {
        if (!product.codigo) continue
        
        try {
          const existing = await prisma.product.findFirst({
            where: { codigo: product.codigo }
          })

          if (existing) {
            duplicates.push({
              codigo: product.codigo,
              existing: {
                name: existing.name,
                stock: existing.stockQuantity,
                brand: existing.brand
              },
              new: {
                name: product.descripcion,
                stock: product.stock,
                brand: product.brand
              }
            })
          }
        } catch (error) {
          console.error(`Error checking duplicate for ${product.codigo}:`, error)
        }
      }

      // Si hay duplicados, devolverlos para confirmación
      if (duplicates.length > 0) {
        return NextResponse.json({
          needsConfirmation: true,
          duplicates,
          message: `Se encontraron ${duplicates.length} productos con códigos duplicados. ¿Desea actualizarlos?`
        })
      }
    }

    // Si no hay duplicados o ya se confirmó, procesar normalmente
    for (const product of products) {
      try {
        // Mapeo mejorado de campos del ERP a nuestro formato
        const productData = {
          codigo: product.codigo || null,
          name: product.descripcion?.trim() || 'Sin nombre',
          brand: product.brand || 'Importado',
          description: product.descripcion?.trim() || '',
          price: product.price || 0,
          categoryKey: product.categoryKey || 'electronics',
          image: product.foto === 'N/D' ? '' : (product.foto || ''),
          images: [],
          rating: 0,
          reviews: 0,
          inStock: (product.stock || 0) > 0,
          stockQuantity: product.stock || 1,
          featured: false,
          // Campos AEX
          weight: 0.5,
          length: 20,
          width: 15,
          height: 10,
          valorDeclarado: null,
          descripcionAduana: null,
          categoriaArancelaria: null,
          paisOrigen: 'Importado',
        }

        // Verificar si existe por código
        if (product.codigo) {
          const existing = await prisma.product.findFirst({
            where: { codigo: product.codigo }
          })

          if (existing) {
            // Actualizar producto existente
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                ...productData,
                updatedAt: new Date()
              }
            })
            console.log(`🔄 Updated: ${product.descripcion} (código: ${product.codigo})`)
            updated++
            continue
          }
        }

        // Crear nuevo producto
        await prisma.product.create({
          data: {
            ...productData,
            id: crypto.randomUUID()
          }
        })

        console.log(`✅ Imported: ${product.descripcion} (código: ${product.codigo})`)
        imported++

      } catch (error) {
        const errorMsg = `Error processing ${product.descripcion}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`📊 Import complete: ${imported} imported, ${updated} updated, ${skipped} skipped, ${errors.length} errors`)

    return NextResponse.json({
      imported,
      updated,
      skipped,
      errors: errors.slice(0, 10),
      total: products.length
    })

  } catch (error) {
    console.error('❌ BULK IMPORT - Error:', error)
    return NextResponse.json({ 
      error: "Failed to import products",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
