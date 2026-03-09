import { prisma } from "../lib/db"

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
}

async function main() {
  const raw = await prisma.product.findMany({
    select: { brand: true },
    distinct: ["brand"],
    where: { brand: { not: "" } },
    orderBy: { brand: "asc" },
  })

  console.log(`Found ${raw.length} unique brands`)

  let created = 0
  let skipped = 0

  for (const { brand } of raw) {
    if (!brand?.trim()) continue
    const slug = slugify(brand)
    try {
      await prisma.brand.upsert({
        where: { slug },
        update: {},
        create: { name: brand.trim(), slug, active: true },
      })
      created++
      console.log(`✓ ${brand}`)
    } catch (e) {
      console.log(`✗ ${brand} (skip)`)
      skipped++
    }
  }

  console.log(`\nDone: ${created} created/updated, ${skipped} skipped`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
