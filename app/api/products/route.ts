import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

function parseNumber(value: string | null, fallback: number) {
  if (!value) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseSort(sort: string | null): { [key: string]: "asc" | "desc" }[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }]
    case "price_desc":
      return [{ price: "desc" }]
    case "rating_desc":
      return [{ rating: "desc" }]
    case "latest":
      return [{ createdAt: "desc" }]
    default:
      return [{ featured: "desc" }, { name: "asc" }]
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, parseNumber(searchParams.get("page"), 1))
    const limit = Math.min(100, Math.max(1, parseNumber(searchParams.get("limit"), 20)))
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort")
    const search = (searchParams.get("search") ?? "").trim()

    const where: any = {}

    if (category) {
      where.categoryKey = category
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ]
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: parseSort(sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
