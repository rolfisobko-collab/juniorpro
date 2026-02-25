import "dotenv/config"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import WebSocket from "ws"

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is missing")

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })

async function main() {
  console.log('🏷️  Creando subcategoría Videojuegos en electronics...')

  await prisma.subCategory.upsert({
    where: { id: 'electronics-videojuegos' },
    update: { name: 'Videojuegos', slug: 'videojuegos', categoryKey: 'electronics' },
    create: { id: 'electronics-videojuegos', name: 'Videojuegos', slug: 'videojuegos', categoryKey: 'electronics' }
  })

  console.log('✅ Subcategoría creada')

  console.log('🔄 Actualizando productos con subcategoría Videojuegos...')

  const result = await prisma.product.updateMany({
    where: { categoryKey: 'electronics', id: { startsWith: 'game_' } },
    data: { subCategory: 'Videojuegos' }
  })

  console.log(`✅ ${result.count} productos actualizados con subcategoría Videojuegos`)

  await prisma.$disconnect()
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
