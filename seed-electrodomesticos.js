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

function getSubcategory(name) {
  const u = name.toUpperCase()
  if (u.startsWith("AR CONDICIONADO")) return { name: "Aire Acondicionado", slug: "aire-acondicionado" }
  if (u.startsWith("ASPIRADOR")) return { name: "Aspiradoras", slug: "aspiradoras" }
  if (u.startsWith("BATEDEIRA")) return { name: "Batidoras", slug: "batidoras" }
  if (u.startsWith("BEBEDOURO")) return { name: "Bebederos", slug: "bebederos" }
  if (u.startsWith("CAFETEIRA")) return { name: "Cafeteras", slug: "cafeteras" }
  if (u.startsWith("ABRIDOR")) return { name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("BALANCA")) return { name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("CHURRASQUEIRA")) return { name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("CLIMATIZADOR")) return { name: "Climatizadores", slug: "climatizadores" }
  if (u.startsWith("DESUMIDIFICADOR")) return { name: "Climatizadores", slug: "climatizadores" }
  if (u.startsWith("DISPENSER")) return { name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("ESPREMEDOR") || u.startsWith("EXTRATOR")) return { name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("FERRO")) return { name: "Planchas", slug: "planchas" }
  return { name: "Electrodomesticos General", slug: "electrodomesticos-general" }
}

function parseBrand(name) {
  const brands = ["AIWA","AUDISAT","BRITANIA","COBY","ELECTROBRAS","GEMINIS","GREE","HYE","KANDEXS",
    "KRAB","MEGASTAR","MOLIMIX","MONDIAL","MOX","PROSPER","QUANTA","ROBOROCK","SAMSUNG",
    "SATELLITE","SMARTFY","XIAOMI","AIPER","4LIFE"]
  const u = name.toUpperCase()
  return brands.find(b => u.includes(b)) || "GENERICO"
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

  console.log(`🔄 Iniciando inserción de Electrodomésticos...\n`)
  console.log(`📦 ${rawProducts.length} productos encontrados`)

  // Crear todas las subcategorías necesarias
  const subcats = [
    { id: "electrodomesticos-aire-acondicionado", name: "Aire Acondicionado", slug: "aire-acondicionado" },
    { id: "electrodomesticos-aspiradoras", name: "Aspiradoras", slug: "aspiradoras" },
    { id: "electrodomesticos-batidoras", name: "Batidoras", slug: "batidoras" },
    { id: "electrodomesticos-bebederos", name: "Bebederos", slug: "bebederos" },
    { id: "electrodomesticos-cafeteras", name: "Cafeteras", slug: "cafeteras" },
    { id: "electrodomesticos-accesorios-cocina", name: "Accesorios Cocina", slug: "accesorios-cocina" },
    { id: "electrodomesticos-climatizadores", name: "Climatizadores", slug: "climatizadores" },
    { id: "electrodomesticos-planchas", name: "Planchas", slug: "planchas" },
    { id: "electrodomesticos-general", name: "Electrodomesticos General", slug: "electrodomesticos-general" },
  ]

  for (const sub of subcats) {
    await prisma.subCategory.upsert({
      where: { id: sub.id },
      update: { name: sub.name, slug: sub.slug, categoryKey: "electrodomesticos" },
      create: { id: sub.id, name: sub.name, slug: sub.slug, categoryKey: "electrodomesticos" }
    })
  }
  console.log(`✅ ${subcats.length} subcategorías creadas/verificadas\n`)

  let insertedCount = 0
  const batchSize = 10

  for (let i = 0; i < rawProducts.length; i += batchSize) {
    const batch = rawProducts.slice(i, i + batchSize).map((p, idx) => ({
      id: `elec_${p.code}_${Date.now()}_${idx}`,
      name: p.name,
      categoryKey: "electrodomesticos",
      price: p.price,
      image: "/placeholder-electrodomestico.jpg",
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

  console.log(`\n🎉 ¡Listo! Se insertaron ${insertedCount} electrodomésticos`)

  const total = await prisma.product.count({ where: { categoryKey: "electrodomesticos" } })
  console.log(`📊 Total en electrodomesticos ahora: ${total} productos`)

  await prisma.$disconnect()
}

main().catch(e => { console.error("❌ Error:", e.message); process.exit(1) })
