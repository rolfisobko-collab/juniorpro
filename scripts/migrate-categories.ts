import { prisma } from "../lib/db"

async function main() {
  // Migrate smartphones → electronics
  const smResult = await prisma.product.updateMany({
    where: { categoryKey: "smartphones" },
    data: { categoryKey: "electronics" },
  })
  console.log(`✅ Migrated ${smResult.count} smartphones → electronics`)

  // Migrate tablets → electronics
  const tbResult = await prisma.product.updateMany({
    where: { categoryKey: "tablets" },
    data: { categoryKey: "electronics" },
  })
  console.log(`✅ Migrated ${tbResult.count} tablets → electronics`)

  console.log("Done.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
