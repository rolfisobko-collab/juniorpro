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

function parseBrand(name) {
  const upper = name.toUpperCase()
  if (upper.includes("NINTENDO")) return "NINTENDO"
  if (upper.includes("PLAYSTATION") || upper.includes("PS5") || upper.includes("PS4")) return "SONY"
  if (upper.includes("XBOX")) return "MICROSOFT"
  if (upper.includes("STEAM DECK") || upper.includes("VALVE")) return "VALVE"
  if (upper.includes("BLULORY")) return "BLULORY"
  if (upper.includes("POWKIDDY")) return "POWKIDDY"
  if (upper.includes("GAMEPAD")) return "GAMEPAD"
  if (upper.includes("SUP ")) return "SUP"
  if (upper.includes("BOX ")) return "BOX"
  return "GENERICO"
}

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
    products.push({ code, name, price })
  }
  return products
}

async function main() {
  const filePath = path.join(__dirname, "productos-nuevos.txt")
  const rawProducts = parseCSV(filePath)

  console.log(`🔄 Iniciando inserción de Videojuegos...\n`)
  console.log(`📦 ${rawProducts.length} productos encontrados en el archivo`)

  let insertedCount = 0
  const batchSize = 10

  for (let i = 0; i < rawProducts.length; i += batchSize) {
    const batch = rawProducts.slice(i, i + batchSize).map((p, idx) => ({
      id: `game_${p.code}_${Date.now()}_${idx}`,
      name: p.name,
      categoryKey: "electronics",
      price: p.price,
      image: "/placeholder-game.jpg",
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

  console.log(`\n🎉 ¡Listo! Se insertaron ${insertedCount} videojuegos`)

  const total = await prisma.product.count({ where: { categoryKey: "electronics" } })
  console.log(`📊 Total en electronics ahora: ${total} productos`)

  await prisma.$disconnect()
}

main().catch(e => { console.error("❌ Error:", e.message); process.exit(1) })
