import { prisma } from "../lib/db"

async function main() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } })
  const groups: Record<string, typeof brands> = {}
  for (const b of brands) {
    const key = b.name.toLowerCase().trim()
    if (!groups[key]) groups[key] = []
    groups[key].push(b)
  }
  let deleted = 0
  for (const group of Object.values(groups)) {
    if (group.length <= 1) continue
    // Prefer ALL_CAPS version, else keep first
    const keep = group.find(b => b.name === b.name.toUpperCase()) ?? group[0]
    for (const b of group.filter(x => x.id !== keep.id)) {
      await prisma.brand.delete({ where: { id: b.id } })
      console.log(`Deleted "${b.name}" (kept "${keep.name}")`)
      deleted++
    }
  }
  console.log(`Done — ${deleted} duplicates removed, ${brands.length - deleted} brands remain`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
