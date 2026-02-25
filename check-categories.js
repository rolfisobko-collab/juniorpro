import "dotenv/config"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import WebSocket from "ws"

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is missing")
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString,
  }),
})

async function checkCategories() {
  console.log('🔍 Verificando categorías en la base de datos...\n')
  
  try {
    // Obtener todas las categorías
    const categories = await prisma.category.findMany({
      include: { 
        subcategories: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    console.log('📂 CATEGORÍAS PRINCIPALES:')
    console.log('=' .repeat(50))
    
    for (const category of categories) {
      console.log(`\n🏷️  Categoría: ${category.name}`)
      console.log(`   🔑 Key: ${category.key}`)
      console.log(`   🌐 Slug: ${category.slug}`)
      console.log(`   📝 Descripción: ${category.description || 'Sin descripción'}`)
      
      if (category.subcategories.length > 0) {
        console.log(`   📋 Subcategorías (${category.subcategories.length}):`)
        category.subcategories.forEach(sub => {
          console.log(`      • ${sub.name} (${sub.slug})`)
        })
      } else {
        console.log(`   📋 Subcategorías: Ninguna`)
      }
    }

    // Contar productos por categoría
    console.log('\n\n📊 PRODUCTOS POR CATEGORÍA:')
    console.log('=' .repeat(50))
    
    for (const category of categories) {
      const productCount = await prisma.product.count({
        where: { categoryKey: category.key }
      })
      console.log(`${category.name}: ${productCount} productos`)
    }

    const totalProducts = await prisma.product.count()
    console.log(`\n🎯 TOTAL DE PRODUCTOS: ${totalProducts}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
