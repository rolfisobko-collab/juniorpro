import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const contact = await prisma.contactInformation.findFirst({
      orderBy: { id: "asc" },
      include: { socialLinks: true },
    })

    return NextResponse.json(contact)
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch contact info" }, { status: 500 })
  }
}
