export const revalidate = 300

import { unstable_cache } from "next/cache"
import { getCategoriesFromDB } from "@/lib/products-server"
import { prisma } from "@/lib/db"
import ProductsClient from "./products-client"

const keywordMap: Record<string, string[]> = {
  "smartphones":        ["smartphone", "iphone", "samsung galaxy", "xiaomi", "motorola", "celular", "android"],
  "tablets":            ["tablet", "ipad", "tab ", "lenovo tab"],
  "laptops":            ["notebook", "laptop", "macbook", "chromebook"],
  "headphones":         ["fone", "auricular", "headphone", "headset", "earphone", "earbuds", "tws", "buds"],
  "videojuegos":        ["playstation", "xbox", "nintendo", "joystick", "gamepad"],
  "televisores":        ["tv ", "televisor", "television", "smart tv", "oled", "qled"],
  "accesorios":         ["cargador", "cable", "case", "capa", "carregador", "funda", "protector"],
  "aire-acondicionado": ["aire acondicionado", "ar condicionado", "split", "inverter"],
}

const getInitialProducts = unstable_cache(
  async (category?: string, subcategory?: string) => {
    try {
      const where: any = {}
      if (category && category !== "all") where.categoryKey = category
      if (subcategory) {
        const kws = keywordMap[subcategory]
        if (kws) where.OR = kws.map(k => ({ name: { contains: k, mode: "insensitive" } }))
      }
      const sort = subcategory === "videojuegos" ? [{ price: "desc" as const }] : [{ featured: "desc" as const }, { rating: "desc" as const }]
      return await prisma.product.findMany({
        where,
        include: { category: { select: { key: true, name: true, slug: true, description: true } } },
        orderBy: sort,
        take: 50,
      })
    } catch {
      return []
    }
  },
  ["products-catalog"],
  { revalidate: 300, tags: ["products"] } // 5 min cache
)

export default async function ProductsServer({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; subcategory?: string; sort?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const [categories, initialProducts] = await Promise.all([
    getCategoriesFromDB(),
    getInitialProducts(resolvedSearchParams?.category, resolvedSearchParams?.subcategory),
  ])

  return (
    <ProductsClient
      initialProducts={initialProducts as any}
      categories={categories}
      initialCategory={resolvedSearchParams?.category}
      initialSubcategory={resolvedSearchParams?.subcategory}
    />
  )
}
