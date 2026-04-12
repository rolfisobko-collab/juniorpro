import { NextRequest, NextResponse } from "next/server"

interface ExchangeRate {
  id: string; currency: string; rate: number; isActive: boolean; updatedAt: string
}

// Mock data for when database is not available
const MOCK_RATES: ExchangeRate[] = [
  { id: "1", currency: "USD", rate: 1.0, isActive: true, updatedAt: new Date().toISOString() },
  { id: "2", currency: "PYG", rate: 7350.0, isActive: true, updatedAt: new Date().toISOString() },
  { id: "3", currency: "ARS", rate: 890.0, isActive: true, updatedAt: new Date().toISOString() },
  { id: "4", currency: "BRL", rate: 5.2, isActive: true, updatedAt: new Date().toISOString() },
]

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db")
    let rates = await prisma.exchangeRate.findMany({ orderBy: { currency: "asc" } })

    if (rates.length === 0) {
      await Promise.all(
        MOCK_RATES.map((r) =>
          prisma.exchangeRate.upsert({
            where: { id: r.id },
            update: {},
            create: { id: r.id, currency: r.currency, rate: r.rate, isActive: r.isActive },
          })
        )
      )
      rates = await prisma.exchangeRate.findMany({ orderBy: { currency: "asc" } })
    }

    return NextResponse.json({ rates })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json({ rates: MOCK_RATES })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { rates } = await request.json()

    if (!Array.isArray(rates)) {
      return NextResponse.json({ error: "Invalid rates data" }, { status: 400 })
    }

    const { prisma } = await import("@/lib/db")
    for (const rate of rates) {
      await prisma.exchangeRate.update({
        where: { id: rate.id },
        data: { rate: rate.rate, isActive: rate.isActive },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating exchange rates:", error)
    return NextResponse.json({ error: "Error updating exchange rates" }, { status: 500 })
  }
}
