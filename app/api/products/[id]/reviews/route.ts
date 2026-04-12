import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

async function getUserFromRequest(): Promise<{ id: string; name: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const { payload } = await jwtVerify(token, secret)
    if (!payload.userId || !payload.name) return null
    return { id: payload.userId as string, name: payload.name as string }
  } catch {
    return null
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({ reviews, avg: Math.round(avg * 10) / 10, total: reviews.length })
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  try {
    const { rating, comment } = await req.json()
    if (!rating || rating < 1 || rating > 5)
      return NextResponse.json({ error: "Rating inválido (1-5)" }, { status: 400 })

    const review = await prisma.review.upsert({
      where: { productId_userId: { productId, userId: user.id } },
      update: { rating, comment: comment || null },
      create: { productId, userId: user.id, rating, comment: comment || null },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    // Actualizar rating y reviews en el producto
    const all = await prisma.review.findMany({ where: { productId }, select: { rating: true } })
    const newAvg = all.reduce((s, r) => s + r.rating, 0) / all.length
    await prisma.product.update({
      where: { id: productId },
      data: { rating: Math.round(newAvg * 10) / 10, reviews: all.length },
    })

    return NextResponse.json({ review })
  } catch (e: any) {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  try {
    await prisma.review.delete({
      where: { productId_userId: { productId, userId: user.id } },
    })

    const all = await prisma.review.findMany({ where: { productId }, select: { rating: true } })
    if (all.length > 0) {
      const newAvg = all.reduce((s, r) => s + r.rating, 0) / all.length
      await prisma.product.update({
        where: { id: productId },
        data: { rating: Math.round(newAvg * 10) / 10, reviews: all.length },
      })
    } else {
      await prisma.product.update({ where: { id: productId }, data: { rating: 0, reviews: 0 } })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
