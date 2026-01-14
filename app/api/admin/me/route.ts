import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/db"
import { verifyAccessToken } from "@/lib/auth-server"

export async function GET() {
  try {
    const jar = await cookies()
    const token = jar.get("tz_admin_access")?.value
    if (!token) return NextResponse.json({ admin: null }, { status: 401 })

    const payload = await verifyAccessToken(token)
    if (payload.typ !== "admin" || typeof payload.sub !== "string") {
      return NextResponse.json({ admin: null }, { status: 401 })
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
        active: true,
      },
    })

    if (!admin || !admin.active) return NextResponse.json({ admin: null }, { status: 401 })

    return NextResponse.json({ admin })
  } catch (_error) {
    return NextResponse.json({ admin: null }, { status: 401 })
  }
}
