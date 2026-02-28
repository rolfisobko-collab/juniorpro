import { prisma } from "../lib/db"

async function main() {
  const sm = await prisma.product.count({ where: { categoryKey: "smartphones" } })
  const tb = await prisma.product.count({ where: { categoryKey: "tablets" } })
  console.log("Remaining products - smartphones:", sm, "tablets:", tb)

  const delSmSub = await prisma.subCategory.deleteMany({ where: { category: { key: "smartphones" } } })
  const delTbSub = await prisma.subCategory.deleteMany({ where: { category: { key: "tablets" } } })
  console.log("Deleted subcategories - sm:", delSmSub.count, "tb:", delTbSub.count)

  const delSm = await prisma.category.deleteMany({ where: { key: "smartphones" } })
  const delTb = await prisma.category.deleteMany({ where: { key: "tablets" } })
  console.log("Deleted categories - sm:", delSm.count, "tb:", delTb.count)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
