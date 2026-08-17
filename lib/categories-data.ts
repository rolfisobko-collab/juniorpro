export interface SubCategory {
  id?: string
  name: string
  slug: string
}

export interface Category {
  id?: string
  name: string
  slug: string
  description?: string
  subcategories: SubCategory[]
}

let categoriesStore: Category[] = [
  {
    id: "1",
    name: "Electronica",
    slug: "electronics",
    description: "Dispositivos y accesorios tecnologicos",
    subcategories: [
      { id: "1-1", name: "Smartphones", slug: "smartphones" },
      { id: "1-3", name: "Tablets", slug: "tablets" },
      { id: "1-4", name: "Auriculares", slug: "headphones" },
      { id: "1-5", name: "Videojuegos", slug: "videojuegos" },
      { id: "1-6", name: "Accesorios", slug: "accesorios" },
    ],
  },
  {
    id: "2",
    name: "Electrodomesticos",
    slug: "electrodomesticos",
    description: "Productos para el hogar",
    subcategories: [
      { id: "2-1", name: "Freidoras", slug: "freidoras" },
      { id: "2-2", name: "Aspiradoras", slug: "aspiradoras" },
      { id: "2-3", name: "Cafeteras", slug: "cafeteras" },
      { id: "2-4", name: "Planchas", slug: "planchas" },
      { id: "2-5", name: "Climatizadores", slug: "climatizadores" },
      { id: "2-6", name: "Televisores", slug: "televisores" },
    ],
  },
  {
    id: "3",
    name: "General",
    slug: "general",
    description: "Productos generales del catalogo",
    subcategories: [
      { id: "3-1", name: "General", slug: "geral" },
      { id: "3-2", name: "Audio", slug: "headphones" },
      { id: "3-3", name: "Notebook", slug: "laptops" },
    ],
  },
]

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch("/api/categories")
    if (!response.ok) throw new Error("Failed to fetch categories")

    const categoriesData = await response.json()
    return categoriesData.map((cat: any) => ({
      id: cat.key,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      subcategories: (cat.subcategories ?? []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
      })),
    }))
  } catch (error) {
    console.error("Error fetching categories from API:", error)
    return categoriesStore
  }
}

export const getCategoriesSync = (): Category[] => {
  return categoriesStore
}

export const setCategories = (categories: Category[]) => {
  categoriesStore = categories
  if (typeof window !== "undefined") {
    localStorage.setItem("techzone_categories", JSON.stringify(categories))
  }
}

export const categories = categoriesStore
