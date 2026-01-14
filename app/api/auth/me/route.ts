import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/db"
import { verifyAccessToken } from "@/lib/auth-server"

export async function GET() {
  try {
    const jar = await cookies()
    const token = jar.get("tz_access")?.value
    if (!token) return NextResponse.json({ user: null }, { status: 401 })

    const payload = await verifyAccessToken(token)
    if (payload.typ !== "user" || typeof payload.sub !== "string") {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, avatar: true },
    })

    if (!user) return NextResponse.json({ user: null }, { status: 401 })

    return NextResponse.json({ user })
  } catch (_error) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
