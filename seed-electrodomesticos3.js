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
  if (u.startsWith("JARRA")) return { id: "electrodomesticos-jarras", name: "Jarras Electricas", slug: "jarras-electricas" }
  if (u.startsWith("LIQUIDIFICADOR")) return { id: "electrodomesticos-liquidificadores", name: "Licuadoras", slug: "licuadoras" }
  if (u.startsWith("MICROONDA")) return { id: "electrodomesticos-microondas", name: "Microondas", slug: "microondas" }
  if (u.startsWith("MIXER")) return { id: "electrodomesticos-mixers", name: "Mixers", slug: "mixers" }
  if (u.startsWith("MAQUINA GELO")) return { id: "electrodomesticos-maquinas-gelo", name: "Maquinas de Hielo", slug: "maquinas-hielo" }
  if (u.startsWith("MAQUINA WAFFLE") || u.startsWith("MAQUINA DONUTS")) return { id: "electrodomesticos-accesorios-cocina", name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("MAQUINA OVO")) return { id: "electrodomesticos-accesorios-cocina", name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("MOEDOR")) return { id: "electrodomesticos-accesorios-cocina", name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("PANELA")) return { id: "electrodomesticos-panelas", name: "Ollas Electricas", slug: "ollas-electricas" }
  if (u.startsWith("PASSADEIRA")) return { id: "electrodomesticos-planchas", name: "Planchas", slug: "planchas" }
  if (u.startsWith("PIPOQUEIRA")) return { id: "electrodomesticos-accesorios-cocina", name: "Accesorios Cocina", slug: "accesorios-cocina" }
  if (u.startsWith("PROCESSADOR")) return { id: "electrodomesticos-processadores", name: "Procesadores", slug: "procesadores" }
  if (u.startsWith("PURIFICADOR")) return { id: "electrodomesticos-climatizadores", name: "Climatizadores", slug: "climatizadores" }
  if (u.startsWith("SANDUICHEIRA")) return { id: "electrodomesticos-sanduicheiras", name: "Sandwicheras", slug: "sandwicheras" }
  if (u.startsWith("SOPRADOR") || u.startsWith("TORRADEIRA") || u.startsWith("RALADOR") || u.startsWith("PAPA BOLINHA")) return { id: "electrodomesticos-accesorios-cocina", name: "Accesorios Cocina", slug: "accesorios-cocina" }
  return { id: "electrodomesticos-general", name: "Electrodomesticos General", slug: "electrodomesticos-general" }
}

function parseBrand(name) {
  const brands = ["AIWA","AUDISAT","BAK","BRITANIA","COBY","ELECTROBRAS","GEMINIS","GREE","HYE",
    "ITATIAIA","KANDEXS","KRAB","MEGASTAR","MIDI PRO","MOLIMIX","MONDIAL","MOX","PROSPER",
    "QUANTA","ROBOROCK","SAMSUNG","SATELLITE","SMARTFY","XIAOMI","AIPER","4LIFE"]
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

  console.log(`🔄 Iniciando inserción de Electrodomésticos (lote 3)...\n`)
  console.log(`📦 ${rawProducts.length} productos encontrados`)

  // Recopilar subcategorías únicas necesarias
  const subcatMap = new Map()
  for (const p of rawProducts) {
    const sub = getSubcategory(p.name)
    subcatMap.set(sub.id, sub)
  }

  for (const sub of subcatMap.values()) {
    await prisma.subCategory.upsert({
      where: { id: sub.id },
      update: { name: sub.name, slug: sub.slug, categoryKey: "electrodomesticos" },
      create: { id: sub.id, name: sub.name, slug: sub.slug, categoryKey: "electrodomesticos" }
    })
  }
  console.log(`✅ ${subcatMap.size} subcategorías creadas/verificadas\n`)

  let insertedCount = 0
  const batchSize = 10

  for (let i = 0; i < rawProducts.length; i += batchSize) {
    const batch = rawProducts.slice(i, i + batchSize).map((p, idx) => ({
      id: `elec3_${p.code}_${Date.now()}_${idx}`,
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

  console.log(`\n🎉 ¡Listo! Se insertaron ${insertedCount} productos`)

  const total = await prisma.product.count({ where: { categoryKey: "electrodomesticos" } })
  console.log(`📊 Total en electrodomesticos ahora: ${total} productos`)

  const subs = await prisma.subCategory.findMany({ where: { categoryKey: "electrodomesticos" } })
  console.log(`🏷️  Subcategorías (${subs.length}): ${subs.map(s => s.name).join(", ")}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error("❌ Error:", e.message); process.exit(1) })
