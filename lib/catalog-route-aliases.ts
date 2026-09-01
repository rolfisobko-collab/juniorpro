const CATEGORY_ALIASES: Record<string, string> = {
  appliances: "electrodomesticos",
  appliance: "electrodomesticos",
  electrodomestico: "electrodomesticos",
  computadoras: "computadoras",
  notebooks: "computadoras",
  laptops: "computadoras",
  electronics: "electronics",
  electronica: "electronics",
  electronicos: "electronics",
}

const SUBCATEGORY_ALIASES: Record<string, string> = {
  smartfone: "smartphones",
  smartphone: "smartphones",
  celulares: "smartphones",
  celular: "smartphones",
  notebook: "laptops",
  notebooks: "laptops",
  laptop: "laptops",
  tablet: "tablets",
  audios: "headphones",
  audio: "headphones",
  auriculares: "headphones",
  fones: "headphones",
  videogame: "videojuegos",
  videojuegos: "videojuegos",
  televisores: "televisores",
  televisor: "televisores",
  tvs: "televisores",
  "tv-box": "accesorios",
  airfrayer: "freidoras",
  airfryer: "freidoras",
  "air-fryer": "freidoras",
  aspirador: "aspiradoras",
  aspiradora: "aspiradoras",
  cafeteira: "cafeteras",
  cafeteria: "cafeteras",
}

function normalizeSlug(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function normalizeCatalogCategoryParam(value?: string | null) {
  const slug = normalizeSlug(value)
  return CATEGORY_ALIASES[slug] || slug
}

export function normalizeCatalogSubcategoryParam(value?: string | null) {
  const slug = normalizeSlug(value)
  return SUBCATEGORY_ALIASES[slug] || slug
}

export function normalizeCatalogFilters(category?: string | null, subcategory?: string | null) {
  const normalizedCategory = normalizeCatalogCategoryParam(category)
  const normalizedSubcategory = normalizeCatalogSubcategoryParam(subcategory)

  if (normalizedCategory === "computadoras") {
    return { category: "electronics", subcategory: normalizedSubcategory || "laptops" }
  }

  return { category: normalizedCategory, subcategory: normalizedSubcategory }
}
