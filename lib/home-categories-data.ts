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
    image: "/optimized/categories/smartphones.webp",
    link: "/products?category=electronics&subcategory=smartfone",
    order: 1,
    active: true,
  },
  {
    id: "2",
    name: "Computadoras",
    image: "/optimized/categories/computadoras.webp",
    link: "/products?category=electronics&subcategory=notebook",
    order: 2,
    active: true,
  },
  {
    id: "3",
    name: "Tablets",
    image: "/optimized/categories/tablets.webp",
    link: "/products?category=electronics&subcategory=tablet",
    order: 3,
    active: true,
  },
  {
    id: "4",
    name: "Videojuegos",
    image: "/optimized/categories/videojuegos.webp",
    link: "/products?category=electronics&subcategory=videogame",
    order: 4,
    active: true,
  },
  {
    id: "5",
    name: "Auriculares",
    image: "/optimized/categories/audio.webp",
    link: "/products?category=electronics&subcategory=audios",
    order: 5,
    active: true,
  },
  {
    id: "6",
    name: "Accesorios",
    image: "/optimized/categories/accesorios.webp",
    link: "/products?category=electronics",
    order: 6,
    active: true,
  },
  {
    id: "7",
    name: "TV Box",
    image: "/optimized/categories/tv-box.webp",
    link: "/products?category=electronics&subcategory=tv-box",
    order: 7,
    active: true,
  },
  {
    id: "8",
    name: "Freidoras",
    image: "/optimized/categories/freidoras.webp",
    link: "/products?category=appliances&subcategory=airfrayer",
    order: 8,
    active: true,
  },
  {
    id: "9",
    name: "Electrodomésticos",
    image: "/optimized/categories/electrodomesticos.webp",
    link: "/products?category=appliances",
    order: 9,
    active: true,
  },
  {
    id: "10",
    name: "Audio",
    image: "/optimized/categories/audio.webp",
    link: "/products?category=electronics&subcategory=audios",
    order: 10,
    active: false,
  },
  {
    id: "11",
    name: "Notebooks",
    image: "/optimized/categories/computadoras.webp",
    link: "/products?category=electronics&subcategory=notebook",
    order: 11,
    active: false,
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
