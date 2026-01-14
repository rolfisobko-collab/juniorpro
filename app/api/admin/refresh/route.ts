import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/db"
import { cookieOptions, generateRefreshToken, hashToken, signAccessToken, verifyTokenHash } from "@/lib/auth-server"

export async function POST() {
  try {
    const jar = await cookies()
    const refresh = jar.get("tz_admin_refresh")?.value
    if (!refresh) return NextResponse.json({ error: "No refresh" }, { status: 401 })

    const candidates = await prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
        adminUserId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    let match: (typeof candidates)[number] | null = null
    for (const rt of candidates) {
      if (await verifyTokenHash(refresh, rt.tokenHash)) {
        match = rt
        break
      }
    }

    if (!match || !match.adminUserId) {
      return NextResponse.json({ error: "Invalid refresh" }, { status: 401 })
    }

    await prisma.refreshToken.update({
      where: { id: match.id },
      data: { revokedAt: new Date() },
    })

    const newAccess = await signAccessToken({ sub: match.adminUserId, typ: "admin" }, "15m")
    const newRefresh = generateRefreshToken()

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefresh),
        adminUserId: match.adminUserId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    })

    jar.set("tz_admin_access", newAccess, { ...cookieOptions(), maxAge: 60 * 15 })
    jar.set("tz_admin_refresh", newRefresh, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 30 })

    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 })
  }
}
