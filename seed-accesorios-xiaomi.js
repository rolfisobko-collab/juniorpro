import "dotenv/config"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import WebSocket from "ws"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is missing")

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.split("\n").map(l => l.trim()).filter(l => l && l !== "codigo,producto,precio")
  const products = []
  for (const line of lines) {
    const parts = line.split(",")
    if (parts.length < 3) continue
    const code = parts[0].trim()
    const price = parseFloat(parts[parts.length - 1].trim())
    const name = parts.slice(1, parts.length - 1).join(",").trim()
    if (!code || isNaN(price) || !name) continue
    // Saltear TVs — ya están insertadas
    if (name.toUpperCase().startsWith("TV ")) continue
    products.push({ code, name, price })
  }
  return products
}

function parseBrand(name) {
  const upper = name.toUpperCase()
  if (upper.includes("XIAOMI")) return "XIAOMI"
  return "XIAOMI"
}

async function main() {
  const filePath = path.join(__dirname, "productos-nuevos.txt")
  const rawProducts = parseCSV(filePath)

  console.log(`🔄 Iniciando inserción de Accesorios XIAOMI...\n`)
  console.log(`📦 ${rawProducts.length} productos encontrados (TVs salteadas)`)

  let insertedCount = 0
  const batchSize = 10

  for (let i = 0; i < rawProducts.length; i += batchSize) {
    const batch = rawProducts.slice(i, i + batchSize).map((p, idx) => ({
      id: `acc_${p.code}_${Date.now()}_${idx}`,
      name: p.name,
      categoryKey: "electronics",
      price: p.price,
      image: "/placeholder-electronics.jpg",
      description: `${p.name}. Garantía: 1 año.`,
      brand: parseBrand(p.name),
      rating: 4.5,
      reviews: 0,
      inStock: true,
      stockQuantity: 10,
      featured: false,
    }))

    await prisma.product.createMany({ data: batch })
    insertedCount += batch.length
    console.log(`✅ Progreso: ${insertedCount}/${rawProducts.length} productos insertados`)
  }

  console.log(`\n🎉 ¡Listo! Se insertaron ${insertedCount} accesorios XIAOMI`)

  const total = await prisma.product.count({ where: { categoryKey: "electronics" } })
  console.log(`📊 Total en electronics ahora: ${total} productos`)

  await prisma.$disconnect()
}

main().catch(e => { console.error("❌ Error:", e.message); process.exit(1) })
