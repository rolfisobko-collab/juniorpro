import mysql from "mysql2/promise"
import type { ProductWithCategory } from "./products-db"
import { prisma } from "./db"

type MirrorProductRow = {
  prd_codigo: string | number
  prd_codigodig: string | null
  prd_descricao: string | null
  prd_nomelongo: string | null
  prd_estoque: string | number | null
  prd_referencia: string | null
  prd_preco_venta: string | number | null
  prd_preco_minimo: string | number | null
  prd_preco_web: string | number | null
  mrc_descricao: string | null
  grp_descricao: string | null
  sgr_descricao: string | null
}

type MirrorFilters = {
  page?: number
  limit?: number
  category?: string | null
  subcategory?: string | null
  search?: string
  minPrice?: string | null
  maxPrice?: string | null
  sort?: string | null
  excludeId?: string
}

type ImageCandidate = {
  name: string
  brand: string | null
  image: string
  normalizedName: string
  tokens: Set<string>
}

let imageCatalogCache: { expiresAt: number; items: ImageCandidate[] } | null = null
let imageOverrideCache: { expiresAt: number; items: Map<string, string> } | null = null
let overridesEnsured = false

const CATEGORY_META: Record<string, { name: string; slug: string; description: string }> = {
  electronics: {
    name: "Electronica",
    slug: "electronics",
    description: "Celulares, notebooks, consolas, tablets, audio y accesorios.",
  },
  appliances: {
    name: "Electrodomesticos",
    slug: "appliances",
    description: "Productos de uso domestico y cocina.",
  },
  perfumes: {
    name: "Perfumes",
    slug: "perfumes",
    description: "Fragancias y productos de perfumeria.",
  },
  toys: {
    name: "Juguetes",
    slug: "toys",
    description: "Juguetes y articulos recreativos.",
  },
  vapers: {
    name: "Vapers",
    slug: "vapers",
    description: "Vapers, pods y accesorios.",
  },
  general: {
    name: "General",
    slug: "general",
    description: "Productos generales del catalogo.",
  },
}

const APPLIANCE_SUBGROUPS = new Set(["AIRFRAYER", "ASPIRADOR", "CAFETEIRA", "PLANCHAS"])

const CATEGORY_ALIASES: Record<string, string> = {
  electrodomesticos: "appliances",
  electrodomestico: "appliances",
  appliances: "appliances",
  computadoras: "electronics",
  informatica: "electronics",
  electronica: "electronics",
  electronicos: "electronics",
  electronics: "electronics",
  celulares: "electronics",
  smartphones: "electronics",
}

const SUBCATEGORY_ALIASES: Record<string, string> = {
  smartphones: "smartfone",
  smartphone: "smartfone",
  celulares: "smartfone",
  laptops: "notebook",
  notebooks: "notebook",
  computadoras: "notebook",
  tablets: "tablet",
  smartwatchs: "smartwatch",
  smartwatches: "smartwatch",
  auriculares: "audios",
  headphones: "audios",
  audio: "audios",
  videojuegos: "videogame",
  freidoras: "airfrayer",
  "air-fryer": "airfrayer",
  airfryer: "airfrayer",
  aspiradoras: "aspirador",
  cafeteras: "cafeteira",
}

export function normalizeMirrorCategory(value?: string | null) {
  if (!value) return ""
  const key = normalizeSubcategory(value)
  return CATEGORY_ALIASES[key] || key
}

export function normalizeMirrorSubcategory(value?: string | null) {
  if (!value) return ""
  const key = normalizeSubcategory(value)
  return SUBCATEGORY_ALIASES[key] || key
}

export function isMirrorCatalogEnabled() {
  const source = (process.env.PRODUCT_SOURCE || "").replace(/^\uFEFF/, "").replace(/^ï»¿/, "").trim()
  return source === "mirror" && Boolean(process.env.TECHZONE_DB_HOST)
}

function getPool() {
  return mysql.createPool({
    host: process.env.TECHZONE_DB_HOST,
    port: Number(process.env.TECHZONE_DB_PORT || 3306),
    user: process.env.TECHZONE_DB_USER,
    password: process.env.TECHZONE_DB_PASSWORD,
    database: process.env.TECHZONE_DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
  })
}

function toNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function clean(value?: unknown) {
  return value == null ? "" : String(value).trim()
}

function normalizeText(value: unknown) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function tokenSet(value: unknown) {
  const ignored = new Set(["com", "para", "plus", "pro", "max", "black", "white", "blue", "red", "gold", "silver"])
  return new Set(normalizeText(value).split(" ").filter(token => token.length > 2 && !ignored.has(token)))
}

function categoryKeyFromRow(row: Pick<MirrorProductRow, "grp_descricao" | "sgr_descricao" | "prd_descricao" | "prd_nomelongo">) {
  const group = clean(row.grp_descricao).toUpperCase()
  const subgroup = clean(row.sgr_descricao).toUpperCase()
  const name = `${row.prd_descricao || ""} ${row.prd_nomelongo || ""}`.toUpperCase()

  if (APPLIANCE_SUBGROUPS.has(subgroup)) return "appliances"
  if (name.includes("CAFETEIRA") || name.includes("AIRFRY") || name.includes("ASPIRADOR") || name.includes("PLANCHA")) return "appliances"
  if (group.includes("PERFUME")) return "perfumes"
  if (group.includes("BRINQUEDO")) return "toys"
  if (group.includes("VAPER")) return "vapers"
  if (group.includes("ELECTRONICO")) return "electronics"
  return "general"
}

function getCategory(key: string) {
  const meta = CATEGORY_META[key] || CATEGORY_META.general
  return { key, ...meta }
}

async function getImageCatalog() {
  if (imageCatalogCache && imageCatalogCache.expiresAt > Date.now()) return imageCatalogCache.items

  try {
    const products = await prisma.product.findMany({
      select: { name: true, brand: true, image: true },
      where: { image: { not: "/placeholder.svg" } },
    })

    const items = products
      .filter(product => product.image && !product.image.includes("placeholder"))
      .map(product => ({
        name: product.name,
        brand: product.brand,
        image: product.image,
        normalizedName: normalizeText(product.name),
        tokens: tokenSet(product.name),
      }))

    imageCatalogCache = { expiresAt: Date.now() + 10 * 60 * 1000, items }
    return items
  } catch (error) {
    console.warn("Mirror image catalog unavailable:", error)
    return []
  }
}

export async function ensureMirrorImageOverrideTable() {
  if (overridesEnsured) return
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductImageOverride" (
      "productCode" TEXT PRIMARY KEY,
      "imageUrl" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  overridesEnsured = true
}

async function getImageOverrides() {
  if (imageOverrideCache && imageOverrideCache.expiresAt > Date.now()) return imageOverrideCache.items

  try {
    await ensureMirrorImageOverrideTable()
    const rows = await prisma.$queryRawUnsafe<Array<{ productCode: string; imageUrl: string }>>(
      `SELECT "productCode", "imageUrl" FROM "ProductImageOverride"`
    )
    const items = new Map(rows.map(row => [String(row.productCode), row.imageUrl]))
    imageOverrideCache = { expiresAt: Date.now() + 60 * 1000, items }
    return items
  } catch (error) {
    console.warn("Mirror image overrides unavailable:", error)
    return new Map<string, string>()
  }
}

export async function saveMirrorImageOverride(productIdOrCode: string, imageUrl: string) {
  const productCode = productIdOrCode.replace(/^mirror-/, "")
  await ensureMirrorImageOverrideTable()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ProductImageOverride" ("productCode", "imageUrl", "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT ("productCode")
     DO UPDATE SET "imageUrl" = EXCLUDED."imageUrl", "updatedAt" = NOW()`,
    productCode,
    imageUrl
  )
  imageOverrideCache = null
  return { productCode, imageUrl }
}

function similarityScore(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0
  let hits = 0
  for (const token of a) if (b.has(token)) hits++
  return hits / Math.max(a.size, b.size)
}

function findBestImage(productCode: string, productName: string, brand: string, catalog: ImageCandidate[], overrides: Map<string, string>) {
  const override = overrides.get(productCode)
  if (override) return override

  const normalizedName = normalizeText(productName)
  const exact = catalog.find(item => item.normalizedName === normalizedName)
  if (exact) return exact.image

  const productTokens = tokenSet(productName)
  let best: ImageCandidate | null = null
  let bestScore = 0
  const normalizedBrand = normalizeText(brand)

  for (const item of catalog) {
    const score = similarityScore(productTokens, item.tokens)
    const itemBrand = normalizeText(item.brand)
    const brandBoost = normalizedBrand && itemBrand && normalizedBrand === itemBrand ? 0.05 : 0
    const finalScore = score + brandBoost
    if (finalScore > bestScore) {
      bestScore = finalScore
      best = item
    }
  }

  return best && bestScore >= 0.82 ? best.image : "/placeholder.svg"
}

function normalizeSubcategory(value?: string | null) {
  const label = clean(value) || "General"
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function mapSort(sort?: string | null) {
  switch (sort) {
    case "price_asc":
      return "price ASC, name ASC"
    case "price_desc":
      return "price DESC, name ASC"
    case "latest":
      return "CAST(p.prd_codigo AS UNSIGNED) DESC"
    default:
      return "name ASC"
  }
}

function buildWhere(filters: MirrorFilters) {
  const where: string[] = []
  const params: Array<string | number> = []

  if (filters.excludeId?.startsWith("mirror-")) {
    where.push("CAST(p.prd_codigo AS CHAR) <> ?")
    params.push(filters.excludeId.replace("mirror-", ""))
  }

  if (filters.search) {
    const term = `%${filters.search}%`
    where.push(`(
      p.prd_descricao LIKE ? OR
      p.prd_nomelongo LIKE ? OR
      p.prd_referencia LIKE ? OR
      p.prd_codigodig LIKE ? OR
      CAST(p.prd_codigo AS CHAR) LIKE ? OR
      m.mrc_descricao LIKE ? OR
      g.grp_descricao LIKE ? OR
      sg.sgr_descricao LIKE ?
    )`)
    params.push(term, term, term, term, term, term, term, term)
  }

  const category = normalizeMirrorCategory(filters.category)
  if (category && category !== "all") {
    if (category === "perfumes") where.push("g.grp_descricao LIKE '%PERFUME%'")
    if (category === "toys") where.push("g.grp_descricao LIKE '%BRINQUEDO%'")
    if (category === "vapers") where.push("g.grp_descricao LIKE '%VAPER%'")
    if (category === "electronics") where.push("g.grp_descricao LIKE '%ELECTRONICO%'")
    if (category === "appliances") where.push("sg.sgr_descricao IN ('AIRFRAYER','ASPIRADOR','CAFETEIRA','PLANCHAS')")
    if (category === "general") where.push("g.grp_descricao LIKE '%GERAL%'")
  }

  if (filters.subcategory) {
    const subcategory = normalizeMirrorSubcategory(filters.subcategory)
    where.push("LOWER(REPLACE(sg.sgr_descricao, ' ', '-')) = ?")
    params.push(subcategory.toLowerCase())
  }

  if (filters.minPrice) {
    where.push("COALESCE(NULLIF(p.prd_preco_web, 0), NULLIF(p.prd_preco_venta, 0), p.prd_preco_minimo, 0) >= ?")
    params.push(Number(filters.minPrice))
  }

  if (filters.maxPrice) {
    where.push("COALESCE(NULLIF(p.prd_preco_web, 0), NULLIF(p.prd_preco_venta, 0), p.prd_preco_minimo, 0) <= ?")
    params.push(Number(filters.maxPrice))
  }

  return {
    sql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params,
  }
}

function selectSql() {
  return `
    SELECT
      p.prd_codigo,
      p.prd_codigodig,
      p.prd_descricao,
      p.prd_nomelongo,
      p.prd_estoque,
      p.prd_referencia,
      p.prd_preco_venta,
      p.prd_preco_minimo,
      p.prd_preco_web,
      m.mrc_descricao,
      g.grp_descricao,
      sg.sgr_descricao,
      COALESCE(NULLIF(p.prd_preco_web, 0), NULLIF(p.prd_preco_venta, 0), p.prd_preco_minimo, 0) AS price,
      COALESCE(NULLIF(p.prd_nomelongo, ''), NULLIF(p.prd_descricao, ''), CONCAT('Producto ', p.prd_codigo)) AS name
    FROM produtos p
    LEFT JOIN marcas m ON m.mrc_codigo = p.prd_marca
    LEFT JOIN grupos g ON g.grp_codigo = p.prd_grupo
    LEFT JOIN sgrupos sg ON sg.sgr_codigo = p.prd_subgrupo
  `
}

export function mapMirrorProduct(
  row: MirrorProductRow,
  imageCatalog: ImageCandidate[] = [],
  imageOverrides: Map<string, string> = new Map()
): ProductWithCategory & Record<string, unknown> {
  const categoryKey = categoryKeyFromRow(row)
  const category = getCategory(categoryKey)
  const name = clean(row.prd_nomelongo) || clean(row.prd_descricao) || `Producto ${row.prd_codigo}`
  const stockQuantity = toNumber(row.prd_estoque)
  const price = toNumber(row.prd_preco_web) || toNumber(row.prd_preco_venta) || toNumber(row.prd_preco_minimo)
  const brand = clean(row.mrc_descricao) || "Sin marca"
  const subgroup = clean(row.sgr_descricao)
  const reference = clean(row.prd_referencia)
  const code = String(row.prd_codigo)

  const image = findBestImage(code, name, brand, imageCatalog, imageOverrides)

  return {
    id: `mirror-${code}`,
    name,
    categoryKey,
    price,
    image,
    images: image.includes("placeholder") ? [] : [image],
    description: [
      subgroup && `Linea: ${subgroup}`,
      brand && `Marca: ${brand}`,
      reference && `Referencia: ${reference}`,
      `Codigo interno: ${code}`,
    ].filter(Boolean).join(" | "),
    brand,
    rating: 4.7,
    reviews: 0,
    inStock: true,
    stockQuantity,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    category,
    codigo: code,
    codigoBarra: clean(row.prd_codigodig),
    referencia: reference,
    mirrorGroup: clean(row.grp_descricao),
    mirrorSubgroup: subgroup,
    availabilityLabel: stockQuantity > 0 ? "Disponible" : "Disponible bajo pedido",
  }
}

export async function getMirrorProducts(filters: MirrorFilters = {}) {
  const page = Math.max(1, Number(filters.page || 1))
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)))
  const offset = (page - 1) * limit
  const where = buildWhere(filters)
  const pool = getPool()

  const orderBy = mapSort(filters.sort)
  const [rowsResult, countResult] = await Promise.all([
    pool.query(`${selectSql()} ${where.sql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [...where.params, limit, offset]),
    pool.query(`SELECT COUNT(*) AS total FROM produtos p LEFT JOIN marcas m ON m.mrc_codigo = p.prd_marca LEFT JOIN grupos g ON g.grp_codigo = p.prd_grupo LEFT JOIN sgrupos sg ON sg.sgr_codigo = p.prd_subgrupo ${where.sql}`, where.params),
  ])

  await pool.end()
  const rows = rowsResult[0] as MirrorProductRow[]
  const countRows = countResult[0] as Array<{ total: number }>
  const total = Number(countRows[0]?.total || 0)
  const imageCatalog = await getImageCatalog()
  const imageOverrides = await getImageOverrides()

  return {
    products: rows.map(row => mapMirrorProduct(row, imageCatalog, imageOverrides)),
    total,
    page,
    limit,
  }
}

export async function getMirrorProductById(id: string) {
  if (!id.startsWith("mirror-")) return null
  const code = id.replace("mirror-", "")
  const pool = getPool()
  const [result] = await pool.query(`${selectSql()} WHERE CAST(p.prd_codigo AS CHAR) = ? LIMIT 1`, [code])
  await pool.end()
  const rows = result as MirrorProductRow[]
  const imageCatalog = await getImageCatalog()
  const imageOverrides = await getImageOverrides()
  return rows[0] ? mapMirrorProduct(rows[0], imageCatalog, imageOverrides) : null
}

export async function getMirrorCategories() {
  const pool = getPool()
  const [rows] = await pool.query(`
    SELECT
      g.grp_descricao,
      sg.sgr_descricao,
      COUNT(*) AS total
    FROM produtos p
    LEFT JOIN grupos g ON g.grp_codigo = p.prd_grupo
    LEFT JOIN sgrupos sg ON sg.sgr_codigo = p.prd_subgrupo
    GROUP BY g.grp_descricao, sg.sgr_descricao
    ORDER BY g.grp_descricao, sg.sgr_descricao
  `)
  await pool.end()

  const grouped = new Map<string, any>()
  for (const row of rows as Array<{ grp_descricao: string | null; sgr_descricao: string | null; total: number }>) {
    const key = categoryKeyFromRow({
      grp_descricao: row.grp_descricao,
      sgr_descricao: row.sgr_descricao,
      prd_descricao: "",
      prd_nomelongo: "",
    })
    const current = grouped.get(key) || { ...getCategory(key), subcategories: new Map<string, any>() }
    const slug = normalizeSubcategory(row.sgr_descricao)
    if (slug) {
      current.subcategories.set(slug, {
        id: slug,
        name: clean(row.sgr_descricao) || "General",
        slug,
        categoryKey: key,
        productCount: Number(row.total || 0),
      })
    }
    grouped.set(key, current)
  }

  return Array.from(grouped.values()).map(category => ({
    ...category,
    subcategories: Array.from(category.subcategories.values()),
  }))
}
