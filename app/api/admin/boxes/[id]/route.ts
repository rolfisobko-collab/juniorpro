import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

async function verifyAdmin(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")
  if (!adminId) return null
  return prisma.adminUser.findUnique({ where: { id: adminId } })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, lengthCm, widthCm, heightCm, paddingCm, maxWeightKg, boxWeightKg, isActive, sortOrder } = body

  const box = await prisma.boxStandard.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(lengthCm !== undefined && { lengthCm: parseFloat(lengthCm) }),
      ...(widthCm !== undefined && { widthCm: parseFloat(widthCm) }),
      ...(heightCm !== undefined && { heightCm: parseFloat(heightCm) }),
      ...(paddingCm !== undefined && { paddingCm: parseFloat(paddingCm) }),
      ...(maxWeightKg !== undefined && { maxWeightKg: parseFloat(maxWeightKg) }),
      ...(boxWeightKg !== undefined && { boxWeightKg: parseFloat(boxWeightKg) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
    },
  })

  return NextResponse.json(box)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.boxStandard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
