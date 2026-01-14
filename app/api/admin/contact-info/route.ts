import { NextResponse } from "next/server"
import crypto from "crypto"

import { prisma } from "@/lib/db"
import { requireAdminId } from "@/lib/admin-session"

export async function PUT(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as {
      description?: string
      address?: string
      city?: string
      country?: string
      phone?: string
      email?: string
      weekdays?: string
      saturday?: string
      socialLinks?: Array<{ platform: string; url: string; enabled: boolean }>
    }

    const existing = await prisma.contactInformation.findFirst({ orderBy: { id: "asc" }, include: { socialLinks: true } })
    if (!existing) return NextResponse.json({ error: "Contact info not found" }, { status: 404 })

    const updated = await prisma.$transaction(async (tx) => {
      const contact = await tx.contactInformation.update({
        where: { id: existing.id },
        data: {
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.address !== undefined ? { address: body.address } : {}),
          ...(body.city !== undefined ? { city: body.city } : {}),
          ...(body.country !== undefined ? { country: body.country } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {}),
          ...(body.email !== undefined ? { email: body.email } : {}),
          ...(body.weekdays !== undefined ? { weekdays: body.weekdays } : {}),
          ...(body.saturday !== undefined ? { saturday: body.saturday } : {}),
          updatedAt: new Date().toISOString(),
        },
      })

      if (body.socialLinks) {
        await tx.socialLink.deleteMany({ where: { contactInformationId: existing.id } })
        await tx.socialLink.createMany({
          data: body.socialLinks.map((s) => ({
            id: crypto.randomUUID(),
            platform: s.platform,
            url: s.url,
            enabled: s.enabled,
            contactInformationId: existing.id,
          })),
        })
      }

      return tx.contactInformation.findUnique({ where: { id: existing.id }, include: { socialLinks: true } })
    })

    return NextResponse.json({ contact: updated })
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update contact info" }, { status: 500 })
  }
}
