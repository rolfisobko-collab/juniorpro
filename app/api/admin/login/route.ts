import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/db"
import { cookieOptions, generateRefreshToken, hashToken, signAccessToken, verifyPassword } from "@/lib/auth-server"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { username?: string; password?: string }
    const username = (body.username ?? "").trim()
    const password = body.password ?? ""

    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const admin = await prisma.adminUser.findUnique({ where: { username } })
    if (!admin || !admin.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await verifyPassword(password, admin.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLogin: new Date() } })

    const accessToken = await signAccessToken({ sub: admin.id, typ: "admin" }, "15m")
    const refreshToken = generateRefreshToken()

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        adminUserId: admin.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    })

    const jar = await cookies()
    jar.set("tz_admin_access", accessToken, { ...cookieOptions(), maxAge: 60 * 15 })
    jar.set("tz_admin_refresh", refreshToken, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 30 })

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
      },
    })
  } catch (_error) {
    return NextResponse.json({ error: "Admin login failed" }, { status: 500 })
  }
}
