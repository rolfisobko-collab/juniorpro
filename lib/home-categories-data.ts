export interface HomeCategory {
  id: string
  name: string
  image: string
  link: string
  order: number
  active: boolean
}

export let homeCategories: HomeCategory[] = [
  {
    id: "1",
    name: "Smartphones",
    image: "/premium-smartphones-display.jpg",
    link: "/products?category=Electrónica&subcategory=Smartphones",
    order: 1,
    active: true,
  },
  {
    id: "2",
    name: "Laptops",
    image: "/modern-laptops-workspace.jpg",
    link: "/products?category=Electrónica&subcategory=Laptops",
    order: 2,
    active: true,
  },
  {
    id: "3",
    name: "Audio",
    image: "/premium-headphones-audio.jpg",
    link: "/products?category=Electrónica&subcategory=Audio",
    order: 3,
    active: true,
  },
  {
    id: "4",
    name: "Videojuegos",
    image: "/premium-smartphones-display.jpg",
    link: "/products?category=Electrónica&subcategory=Videojuegos",
    order: 4,
    active: true,
  },
  {
    id: "5",
    name: "Perfumes Masculinos",
    image: "/luxury-men-perfume-bottles.jpg",
    link: "/products?category=Perfumes&subcategory=Masculinos",
    order: 5,
    active: true,
  },
  {
    id: "6",
    name: "Perfumes Femeninos",
    image: "/elegant-women-perfume-bottles.jpg",
    link: "/products?category=Perfumes&subcategory=Femeninos",
    order: 6,
    active: true,
  },
]

export function getActiveHomeCategories(): HomeCategory[] {
  return homeCategories.filter((cat) => cat.active).sort((a, b) => a.order - b.order)
}

export function updateHomeCategory(id: string, updates: Partial<HomeCategory>): void {
  const index = homeCategories.findIndex((cat) => cat.id === id)
  if (index !== -1) {
    homeCategories[index] = { ...homeCategories[index], ...updates }
  }
}

export function createHomeCategory(category: Omit<HomeCategory, "id">): void {
  const newId = (Math.max(...homeCategories.map((c) => Number.parseInt(c.id))) + 1).toString()
  homeCategories.push({ ...category, id: newId })
}

export function deleteHomeCategory(id: string): void {
  homeCategories = homeCategories.filter((cat) => cat.id !== id)
}
