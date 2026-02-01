import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/db"
import { cookieOptions, generateRefreshToken, hashToken, signAccessToken, verifyPassword } from "@/lib/auth-server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { 
      email?: string; 
      password?: string;
      provider?: string;
      providerId?: string;
      name?: string;
      avatar?: string;
    }
    
    // Login con proveedor externo (Google, etc.)
    if (body.provider && body.providerId && body.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: body.email } })
      
      let user = existingUser
      
      if (!user) {
        // Crear nuevo usuario para el proveedor externo
        user = await prisma.user.create({
          data: {
            email: body.email,
            name: body.name || "Usuario",
            avatar: body.avatar,
            passwordHash: "provider-user-no-password", // Hash por defecto para usuarios de proveedores
            emailVerified: new Date(), // Marcar como verificado para usuarios de proveedores
          }
        })
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
    }
    
    // Login tradicional con email/password
    const email = (body.email ?? "").trim().toLowerCase()
    const password = body.password ?? ""

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verificar si el email ha sido verificado
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: "Please verify your email before logging in. Check your inbox for the verification code.",
        requiresVerification: true,
        email: user.email
      }, { status: 401 })
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
    console.error("Login failed", _error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
