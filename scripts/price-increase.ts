import { prisma } from "../lib/db"

async function main() {
  // 1. Electrodomésticos +15% (todos excepto TV y AC que son parte de electrodom pero se manejan igual)
  const electrodom = await prisma.product.updateMany({
    where: { categoryKey: "electrodomesticos" },
    data: { price: { multiply: 1.15 } },
  })
  console.log(`Electrodomésticos +15%: ${electrodom.count} productos`)

  // 2. Televisores +15% (ya incluidos en electrodomésticos, pero por si acaso hay categoryKey propio)
  // Los TV están en electrodomésticos con "TV" en el nombre — ya cubiertos arriba

  // 3. Consolas +8% — electronics con nombre que contiene PLAYSTATION, XBOX, NINTENDO, GAME
  const consolas = await prisma.product.updateMany({
    where: {
      categoryKey: "electronics",
      OR: [
        { name: { contains: "PLAYSTATION", mode: "insensitive" } },
        { name: { contains: "XBOX", mode: "insensitive" } },
        { name: { contains: "NINTENDO", mode: "insensitive" } },
        { name: { contains: "GAME PLAYSTATION", mode: "insensitive" } },
        { name: { contains: "GAME XBOX", mode: "insensitive" } },
        { name: { contains: "GAME NINTENDO", mode: "insensitive" } },
        { name: { contains: "GAMEPAD", mode: "insensitive" } },
      ],
    },
    data: { price: { multiply: 1.08 } },
  })
  console.log(`Consolas +8%: ${consolas.count} productos`)

  // 4. Tablets +12%
  const tablets = await prisma.product.updateMany({
    where: {
      categoryKey: "electronics",
      OR: [
        { name: { contains: "TABLET", mode: "insensitive" } },
        { name: { contains: "IPAD", mode: "insensitive" } },
        { name: { contains: " TAB ", mode: "insensitive" } },
      ],
    },
    data: { price: { multiply: 1.12 } },
  })
  console.log(`Tablets +12%: ${tablets.count} productos`)

  // 5. Notebooks +11%
  const notebooks = await prisma.product.updateMany({
    where: {
      categoryKey: "electronics",
      OR: [
        { name: { contains: "NOTEBOOK", mode: "insensitive" } },
        { name: { contains: "LAPTOP", mode: "insensitive" } },
        { name: { contains: "MACBOOK", mode: "insensitive" } },
        { name: { contains: "CHROMEBOOK", mode: "insensitive" } },
      ],
    },
    data: { price: { multiply: 1.11 } },
  })
  console.log(`Notebooks +11%: ${notebooks.count} productos`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
