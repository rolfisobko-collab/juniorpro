export const revalidate = 300

import { unstable_cache } from "next/cache"
import { getCategoriesFromDB } from "@/lib/products-server"
import { prisma } from "@/lib/db"
import { getMirrorProducts, isMirrorCatalogEnabled } from "@/lib/mirror-products"
import { hasUsableProductImage } from "@/lib/featured-products"
import { normalizeCatalogFilters } from "@/lib/catalog-route-aliases"
import ProductsClient from "./products-client"

const keywordMap: Record<string, string[]> = {
  "smartphones":        ["iphone", "galaxy", "redmi", "poco", "motorola", "moto ", "xiaomi note", "realme", "tecno", "infinix", "huawei", "honor"],
  "tablets":            ["tablet", "ipad", "tab ", "lenovo tab"],
  "laptops":            ["notebook", "laptop", "macbook", "chromebook"],
  "headphones":         ["fone", "auricular", "headphone", "headset", "earphone", "earbuds", "tws", "buds"],
  "videojuegos":        ["playstation", "xbox", "nintendo", "joystick", "gamepad"],
  "televisores":        ["tv ", "televisor", "television", "smart tv", "qled"],
  "accesorios":         ["cargador", "cable", "case", "capa", "carregador", "funda", "protector"],
  "aire-acondicionado": ["aire acondicionado", "ar condicionado", "split", "inverter"],
}

const getInitialProducts = unstable_cache(
  async (category?: string, subcategory?: string) => {
    try {
      const { category: normalizedCategory, subcategory: normalizedSubcategory } = normalizeCatalogFilters(category, subcategory)

      if (isMirrorCatalogEnabled()) {
        const result = await getMirrorProducts({
          category: normalizedCategory,
          subcategory: normalizedSubcategory,
          limit: 50,
          page: 1,
          requireImages: true,
        })
        return result.products
      }

      const where: any = {}
      if (normalizedCategory && normalizedCategory !== "all") where.categoryKey = normalizedCategory
      if (normalizedSubcategory) {
        const kws = keywordMap[normalizedSubcategory]
        if (kws) where.OR = kws.map(k => ({ name: { contains: k, mode: "insensitive" } }))
      }
      if (normalizedSubcategory === "smartphones") {
        const excluded = [
          "cabo", "cable", "carregador", "cargador", "fone", "headphone", "bastao", "selfie",
          "caixa de som", "soundbar", "cadeira", "patinete", "capa", "case", "pelicula",
          "adaptador", "suporte", "power bank", "relogio", "watch", "tablet", " pad ",
        ]
        where.NOT = excluded.map((kw) => ({ name: { contains: kw, mode: "insensitive" as const } }))
      }
      if (normalizedSubcategory === "televisores") {
        const excluded = ["tv box", "mi tv stick", "fire tv", "receptor", "iptv", "nintendo switch"]
        where.NOT = [
          ...(where.NOT || []),
          ...excluded.map((kw) => ({ name: { contains: kw, mode: "insensitive" as const } })),
        ]
      }
      where.image = { startsWith: "http", not: "/placeholder.svg" }
      const sort = normalizedSubcategory === "videojuegos"
        ? [{ price: "desc" as const }, { name: "asc" as const }, { id: "asc" as const }]
        : [{ featured: "desc" as const }, { rating: "desc" as const }, { name: "asc" as const }, { id: "asc" as const }]
      const products = await prisma.product.findMany({
        where,
        include: { category: { select: { key: true, name: true, slug: true, description: true } } },
        orderBy: sort,
        take: 50,
      })
      return products.filter(hasUsableProductImage)
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
  const { category: initialCategory, subcategory: initialSubcategory } = normalizeCatalogFilters(
    resolvedSearchParams?.category,
    resolvedSearchParams?.subcategory,
  )
  const [categories, initialProducts] = await Promise.all([
    getCategoriesFromDB(),
    getInitialProducts(initialCategory, initialSubcategory),
  ])

  return (
    <ProductsClient
      initialProducts={initialProducts as any}
      categories={categories}
      initialCategory={initialCategory}
      initialSubcategory={initialSubcategory}
    />
  )
}
