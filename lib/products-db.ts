import { prisma } from './db'
import { getMirrorProducts, isMirrorCatalogEnabled } from './mirror-products'

export interface ProductWithCategory {
  id: string
  name: string
  categoryKey: string
  price: number
  image: string
  description: string
  brand: string
  rating: number
  reviews: number
  inStock: boolean
  stockQuantity: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  category: {
    key: string
    name: string
    slug: string
    description?: string | null
  }
}

export async function getFeaturedProducts(limit: number = 5): Promise<ProductWithCategory[]> {
  try {
    if (isMirrorCatalogEnabled()) {
      const result = await getMirrorProducts({ limit, page: 1 })
      return result.products
    }

    const products = await prisma.product.findMany({
      where: { featured: true, inStock: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return products
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getLatestProducts(limit: number = 5): Promise<ProductWithCategory[]> {
  try {
    if (isMirrorCatalogEnabled()) {
      const result = await getMirrorProducts({ limit, page: 1, sort: "latest" })
      return result.products
    }

    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return products
  } catch (error) {
    console.error('Error fetching latest products:', error)
    return []
  }
}

export async function getBestSellerProducts(limit: number = 5): Promise<ProductWithCategory[]> {
  try {
    if (isMirrorCatalogEnabled()) {
      const result = await getMirrorProducts({ limit, page: 1 })
      return result.products
    }

    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      take: limit
    })
    return products
  } catch (error) {
    console.error('Error fetching best seller products:', error)
    return []
  }
}

export async function getRecommendedProducts(limit: number = 5): Promise<ProductWithCategory[]> {
  try {
    if (isMirrorCatalogEnabled()) {
      const result = await getMirrorProducts({ limit, page: 1 })
      return result.products
    }

    // For now, return random products. In a real app, this would be based on user preferences
    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: { category: true },
      orderBy: { rating: 'desc' },
      take: limit * 2 // Get more to randomize
    })
    
    // Shuffle and take limit
    return products.sort(() => Math.random() - 0.5).slice(0, limit)
  } catch (error) {
    console.error('Error fetching recommended products:', error)
    return []
  }
}

export async function getAllProducts(limit?: number): Promise<ProductWithCategory[]> {
  try {
    if (isMirrorCatalogEnabled()) {
      const result = await getMirrorProducts({ limit: limit || 100, page: 1 })
      return result.products
    }

    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: limit })
    })
    return products
  } catch (error) {
    console.error('Error fetching all products:', error)
    return []
  }
}
