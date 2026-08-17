import { prisma } from "@/lib/db"
import { getMirrorProductById } from "@/lib/mirror-products"
import { hasUsableProductImage } from "@/lib/featured-products"
import type { UnifiedProduct } from "@/lib/product-types"

export type HomeSectionConfig = {
  id: string
  title: string
  subtitle: string
  eyebrow: string
  href: string
  bg: "white" | "gray"
  position: number
  active: boolean
  mode: "manual" | "auto"
  productIds: string[]
}

const DEFAULT_SECTIONS: HomeSectionConfig[] = [
  {
    id: "best-sellers",
    title: "Mas vendidos",
    subtitle: "Productos elegidos para destacar en la home.",
    eyebrow: "Destacados",
    href: "/products?featured=true",
    bg: "gray",
    position: 1,
    active: true,
    mode: "auto",
    productIds: [],
  },
  {
    id: "appliances",
    title: "Electrodomesticos destacados",
    subtitle: "Equipos y tecnologia para el hogar.",
    eyebrow: "Categoria",
    href: "/products?category=appliances",
    bg: "white",
    position: 2,
    active: true,
    mode: "auto",
    productIds: [],
  },
  {
    id: "new-arrivals",
    title: "Recien llegados",
    subtitle: "Novedades y productos premium del catalogo.",
    eyebrow: "Novedades",
    href: "/products?sort=latest",
    bg: "gray",
    position: 3,
    active: true,
    mode: "auto",
    productIds: [],
  },
]

let ensured = false

export async function ensureHomeSectionsTable() {
  if (ensured) return

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "HomeProductSection" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "subtitle" TEXT NOT NULL DEFAULT '',
      "eyebrow" TEXT NOT NULL DEFAULT '',
      "href" TEXT NOT NULL DEFAULT '/products',
      "bg" TEXT NOT NULL DEFAULT 'white',
      "position" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "mode" TEXT NOT NULL DEFAULT 'auto',
      "productIds" TEXT NOT NULL DEFAULT '[]',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  for (const section of DEFAULT_SECTIONS) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "HomeProductSection"
        ("id", "title", "subtitle", "eyebrow", "href", "bg", "position", "active", "mode", "productIds", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT ("id") DO NOTHING`,
      section.id,
      section.title,
      section.subtitle,
      section.eyebrow,
      section.href,
      section.bg,
      section.position,
      section.active,
      section.mode,
      JSON.stringify(section.productIds),
    )
  }

  ensured = true
}

function parseProductIds(value: unknown) {
  try {
    const parsed = JSON.parse(String(value || "[]"))
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

function mapSection(row: any): HomeSectionConfig {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    subtitle: String(row.subtitle || ""),
    eyebrow: String(row.eyebrow || ""),
    href: String(row.href || "/products"),
    bg: row.bg === "gray" ? "gray" : "white",
    position: Number(row.position || 0),
    active: Boolean(row.active),
    mode: row.mode === "manual" ? "manual" : "auto",
    productIds: parseProductIds(row.productIds),
  }
}

export async function getHomeSections({ includeInactive = false } = {}) {
  await ensureHomeSectionsTable()
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "HomeProductSection"
     ${includeInactive ? "" : `WHERE "active" = true`}
     ORDER BY "position" ASC, "title" ASC`
  )
  return rows.map(mapSection)
}

export async function saveHomeSections(sections: HomeSectionConfig[]) {
  await ensureHomeSectionsTable()

  for (const [index, section] of sections.entries()) {
    await prisma.$executeRawUnsafe(
      `UPDATE "HomeProductSection"
       SET "title" = $2,
           "subtitle" = $3,
           "eyebrow" = $4,
           "href" = $5,
           "bg" = $6,
           "position" = $7,
           "active" = $8,
           "mode" = $9,
           "productIds" = $10,
           "updatedAt" = NOW()
       WHERE "id" = $1`,
      section.id,
      section.title.trim() || "Seccion",
      section.subtitle.trim(),
      section.eyebrow.trim(),
      section.href.trim() || "/products",
      section.bg === "gray" ? "gray" : "white",
      index + 1,
      Boolean(section.active),
      section.mode === "manual" ? "manual" : "auto",
      JSON.stringify(section.productIds || []),
    )
  }
}

export async function getProductsByIds(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds)).filter(Boolean)
  if (!uniqueIds.length) return []

  const products = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        if (id.startsWith("mirror-")) return await getMirrorProductById(id)

        return await prisma.product.findUnique({
          where: { id },
          include: { category: { select: { key: true, name: true, slug: true, description: true } } },
        })
      } catch {
        return null
      }
    }),
  )

  return products
    .filter(Boolean)
    .filter(hasUsableProductImage) as UnifiedProduct[]
}
