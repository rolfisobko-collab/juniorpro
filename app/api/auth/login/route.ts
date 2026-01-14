import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/db"
import { cookieOptions, generateRefreshToken, hashToken, signAccessToken, verifyPassword } from "@/lib/auth-server"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string }
    const email = (body.email ?? "").trim().toLowerCase()
    const password = body.password ?? ""

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const accessToken = await signAccessToken({ sub: user.id, typ: "user" }, "15m")
    const refreshToken = generateRefreshToken()

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    })

    const jar = await cookies()
    jar.set("tz_access", accessToken, { ...cookieOptions(), maxAge: 60 * 15 })
    jar.set("tz_refresh", refreshToken, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 30 })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    })
  } catch (_error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
