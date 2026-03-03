import { unstable_cache } from "next/cache"
import { prisma } from "./db"
import type { ProductWithCategory } from "./products-db"

export async function getProductsFromDB(filters?: {
  category?: string
  featured?: boolean
  inStock?: boolean
  limit?: number
  offset?: number
}): Promise<ProductWithCategory[]> {
  try {
    const where: any = {}
    
    if (filters?.category) {
      where.categoryKey = filters.category
    }
    
    if (filters?.featured !== undefined) {
      where.featured = filters.featured
    }
    
    if (filters?.inStock !== undefined) {
      where.inStock = filters.inStock
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      ...(filters?.limit && { take: filters.limit }),
      ...(filters?.offset && { skip: filters.offset })
    })

    return products
  } catch (error) {
    console.error("Error fetching products from database:", error)
    return []
  }
}

export const getCategoriesFromDB = unstable_cache(
  async (): Promise<any[]> => {
    try {
      const categories = await prisma.category.findMany({
        include: { subcategories: true },
        orderBy: { name: 'asc' }
      })
      return categories
    } catch (error) {
      console.error("Error fetching categories from database:", error)
      return []
    }
  },
  ["categories-db"],
  { revalidate: 600, tags: ["categories"] } // 10 min cache
)
