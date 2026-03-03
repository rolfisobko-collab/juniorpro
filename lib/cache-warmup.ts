import { unstable_cache } from "next/cache"
import { prisma } from "./db"

const CATEGORIES_TO_WARM = [
  { category: undefined, subcategory: undefined },           // all products
  { category: "electronics", subcategory: undefined },
  { category: "electrodomesticos", subcategory: undefined },
  { category: "electronics", subcategory: "smartphones" },
  { category: "electronics", subcategory: "tablets" },
  { category: "electronics", subcategory: "laptops" },
  { category: "electronics", subcategory: "headphones" },
  { category: "electronics", subcategory: "accesorios" },
  { category: "electrodomesticos", subcategory: "televisores" },
  { category: "electrodomesticos", subcategory: "aire-acondicionado" },
]

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

async function fetchCatalogPage(category?: string, subcategory?: string) {
  const where: any = {}
  if (category && category !== "all") where.categoryKey = category
  if (subcategory) {
    const kws = keywordMap[subcategory]
    if (kws) where.OR = kws.map(k => ({ name: { contains: k, mode: "insensitive" } }))
  }
  const sort = subcategory === "videojuegos"
    ? [{ price: "desc" as const }]
    : [{ featured: "desc" as const }, { rating: "desc" as const }]
  return prisma.product.findMany({
    where,
    include: { category: { select: { key: true, name: true, slug: true, description: true } } },
    orderBy: sort,
    take: 50,
  })
}

// Cached versions — same keys as products-server.tsx so they share the same cache
export const warmCatalog = unstable_cache(
  fetchCatalogPage,
  ["products-catalog"],
  { revalidate: 300, tags: ["products"] }
)

export const warmCategories = unstable_cache(
  async () => prisma.category.findMany({ include: { subcategories: true }, orderBy: { name: "asc" } }),
  ["categories-db"],
  { revalidate: 600, tags: ["categories"] }
)

let warmed = false

export async function warmupCache() {
  if (warmed) return
  warmed = true
  try {
    // Fire all warm-up queries in parallel — fills unstable_cache
    await Promise.all([
      warmCategories(),
      ...CATEGORIES_TO_WARM.map(({ category, subcategory }) =>
        warmCatalog(category, subcategory)
      ),
    ])
    console.log("[warmup] cache primed for", CATEGORIES_TO_WARM.length, "catalog pages")
  } catch (e) {
    console.warn("[warmup] failed:", e)
  }
}
