import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { unstable_cache } from "next/cache"

export const revalidate = 60

const getBrands = unstable_cache(
  async () => prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ["brands-public"],
  { revalidate: 300, tags: ["brands"] }
)

export async function GET() {
  try {
    const brands = await getBrands()
    return NextResponse.json({ brands }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" }
    })
  } catch {
    return NextResponse.json({ brands: [] })
  }
}
