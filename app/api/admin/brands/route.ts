import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
}

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ brands })
  } catch {
    return NextResponse.json({ error: "Error fetching brands" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, image, active = true } = body
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })
    const slug = slugify(name)
    const brand = await prisma.brand.create({ data: { name: name.trim(), slug, image: image || null, active } })
    revalidatePath("/")
    return NextResponse.json({ brand }, { status: 201 })
  } catch (e) {
    const err = e as any
    if (err?.code === "P2002") return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 })
    return NextResponse.json({ error: "Error creating brand" }, { status: 500 })
  }
}
