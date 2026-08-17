import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

import { requireAdminId } from "@/lib/admin-session"
import { getHomeSections, getProductsByIds, saveHomeSections, type HomeSectionConfig } from "@/lib/home-sections"
import { prisma } from "@/lib/db"
import { curateFeaturedProducts, hasUsableProductImage } from "@/lib/featured-products"
import { getMirrorProducts, isMirrorCatalogEnabled } from "@/lib/mirror-products"

async function getAutoProducts(section: HomeSectionConfig) {
  const matchesAutoSection = (product: any) => {
    const haystack = [
      product.name,
      product.brand,
      product.categoryKey,
      product.mirrorSubgroup,
      product.mirrorGroup,
      product.description,
    ].join(" ").toLowerCase()

    if (section.id === "appliances") {
      return /robot|aspirador|\btv\b|qled tv|oled tv|google tv|ar condicionado|cafeteira|airfryer/.test(haystack)
    }

    if (section.id === "new-arrivals") {
      return /playstation|ps5|xbox|nintendo|game|macbook|notebook|^nb |ipad|tablet|rtx|msi|asus|lenovo/.test(haystack)
    }

    return true
  }

  try {
    if (isMirrorCatalogEnabled()) {
      const result = await getMirrorProducts({
        page: 1,
        limit: 120,
        sort: section.id === "new-arrivals" ? "latest" : "price_desc",
        category: section.id === "appliances" ? "appliances" : undefined,
        includeTotal: false,
        requireImages: true,
      })
      return curateFeaturedProducts(result.products.filter(hasUsableProductImage).filter(matchesAutoSection), 15)
    }

    const products = await prisma.product.findMany({
      where: { image: { startsWith: "http" } },
      orderBy: section.id === "new-arrivals" ? [{ createdAt: "desc" }] : [{ price: "desc" }],
      take: 80,
      include: { category: { select: { key: true, name: true, slug: true, description: true } } },
    })

    return curateFeaturedProducts(products.filter(hasUsableProductImage).filter(matchesAutoSection), 15)
  } catch {
    return []
  }
}

async function enrichSections(sections: HomeSectionConfig[]) {
  return Promise.all(
    sections.map(async (section) => {
      const manualProducts = section.mode === "manual" ? await getProductsByIds(section.productIds) : []
      const selectedProducts = manualProducts.length ? manualProducts : await getAutoProducts(section)
      return {
        ...section,
        selectedProducts,
        productIds: manualProducts.length ? section.productIds : [],
        previewProductIds: selectedProducts.map((product: any) => product.id),
        mode: manualProducts.length ? "manual" : "auto",
      }
    }),
  )
}

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const sections = await getHomeSections({ includeInactive: true })
    const enriched = await enrichSections(sections)

    return NextResponse.json({ sections: enriched })
  } catch (error) {
    console.error("Error loading home sections:", error)
    return NextResponse.json({ error: "Failed to load home sections" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as { sections?: HomeSectionConfig[] }
    const sections = Array.isArray(body.sections) ? body.sections : []

    if (!sections.length) {
      return NextResponse.json({ error: "No sections received" }, { status: 400 })
    }

    await saveHomeSections(
      sections.map((section) => ({
        id: String(section.id),
        title: String(section.title || "").trim(),
        subtitle: String(section.subtitle || "").trim(),
        eyebrow: String(section.eyebrow || "").trim(),
        href: String(section.href || "/products").trim(),
        bg: section.bg === "gray" ? "gray" : "white",
        position: Number(section.position || 0),
        active: Boolean(section.active),
        mode: section.mode === "manual" ? "manual" : "auto",
        productIds: section.mode === "manual" && Array.isArray(section.productIds) ? section.productIds.map(String) : [],
      })),
    )

    revalidatePath("/")
    revalidateTag("products", "max")

    const saved = await getHomeSections({ includeInactive: true })
    const enriched = await enrichSections(saved)

    return NextResponse.json({ sections: enriched })
  } catch (error) {
    console.error("Error saving home sections:", error)
    return NextResponse.json({ error: "Failed to save home sections" }, { status: 500 })
  }
}
