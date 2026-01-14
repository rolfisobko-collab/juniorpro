import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/db"
import { cookieOptions, generateRefreshToken, hashPassword, hashToken, signAccessToken } from "@/lib/auth-server"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string; name?: string }
    const email = (body.email ?? "").trim().toLowerCase()
    const password = body.password ?? ""
    const name = (body.name ?? "").trim()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: { id: true, email: true, name: true, avatar: true },
    })

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

    return NextResponse.json({ user })
  } catch (_error) {
    return NextResponse.json({ error: "Register failed" }, { status: 500 })
  }
}
