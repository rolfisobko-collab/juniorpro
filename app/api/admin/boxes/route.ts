import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function verifyAdmin(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")
  if (!adminId) return null
  return prisma.adminUser.findUnique({ where: { id: adminId } })
}

export async function GET(req: NextRequest) {
  const boxes = await prisma.boxStandard.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json(boxes)
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { name, lengthCm, widthCm, heightCm, paddingCm, maxWeightKg, boxWeightKg, isActive, sortOrder } = body

  if (!name || !lengthCm || !widthCm || !heightCm || !maxWeightKg) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const box = await prisma.boxStandard.create({
    data: {
      name,
      lengthCm: parseFloat(lengthCm),
      widthCm: parseFloat(widthCm),
      heightCm: parseFloat(heightCm),
      paddingCm: paddingCm !== undefined ? parseFloat(paddingCm) : 3,
      maxWeightKg: parseFloat(maxWeightKg),
      boxWeightKg: boxWeightKg !== undefined ? parseFloat(boxWeightKg) : 0.3,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
    },
  })

  return NextResponse.json(box, { status: 201 })
}
