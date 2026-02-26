export interface BaseProduct {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  description: string
  brand: string
  rating: number
  reviews: number
  inStock: boolean
  weight?: number // Peso en kg para cálculo de envío
  featured?: boolean
}

export interface Product extends BaseProduct {
  category: "electronics" | "appliances" | "perfumes"
}

export interface ProductWithCategory extends BaseProduct {
  categoryKey: string
  stockQuantity: number
  createdAt: Date
  updatedAt: Date
  category: {
    key: string
    name: string
    slug: string
    description?: string | null
  }
}

export type UnifiedProduct = Product | ProductWithCategory

export function isProductWithCategory(product: UnifiedProduct): product is ProductWithCategory {
  return 'categoryKey' in product
}

export function getProductCategory(product: UnifiedProduct): string {
  if (isProductWithCategory(product)) {
    return product.category.name
  }
  return product.category
}

export function getProductId(product: UnifiedProduct): string {
  return product.id
}

export function getProductName(product: UnifiedProduct): string {
  return product.name
}

export function getProductPrice(product: UnifiedProduct): number {
  return product.price
}

export function getProductImage(product: UnifiedProduct): string {
  return product.image
}

export function getProductDescription(product: UnifiedProduct): string {
  return product.description
}

export function getProductBrand(product: UnifiedProduct): string {
  return product.brand
}

export function getProductRating(product: UnifiedProduct): number {
  return product.rating
}

export function getProductReviews(product: UnifiedProduct): number {
  return product.reviews
}

export function getProductStock(product: UnifiedProduct): boolean {
  return product.inStock
}

export function isProductFeatured(product: UnifiedProduct): boolean {
  return product.featured || false
}
