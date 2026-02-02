import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { cookieOptions, generateRefreshToken, signAccessToken, verifyPassword } from "@/lib/auth-server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { username?: string; password?: string }
    const username = (body.username ?? "").trim()
    const password = body.password ?? ""

    let adminUser = null

    // Primero buscar en la base de datos (usuarios creados desde el panel)
    try {
      console.log('🔍 Searching for user:', username)
      const dbAdmin = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { username: username },
            { email: username }
          ]
        }
      })
      
      console.log('👤 Found user:', dbAdmin ? { id: dbAdmin.id, username: dbAdmin.username, active: dbAdmin.active } : 'Not found')
      
      if (dbAdmin && dbAdmin.active) {
        console.log('🔐 Verifying password...')
        const passwordMatch = await verifyPassword(password, dbAdmin.passwordHash)
        console.log('✅ Password match:', passwordMatch)
        
        if (passwordMatch) {
          adminUser = {
            id: dbAdmin.id,
            email: dbAdmin.email,
            username: dbAdmin.username,
            name: dbAdmin.name,
            role: dbAdmin.role,
            permissions: dbAdmin.permissions,
          }
          console.log('🎉 Login successful for:', adminUser.username)
        }
      }
    } catch (dbError) {
      console.log("❌ DB search failed, trying hardcoded users:", dbError)
    }

    // Si no encuentra en BD, buscar en hardcoded (fallback)
    if (!adminUser) {
      const validCredentials = [
        { username: "admin", password: "admin2346", role: "superadmin", name: "Administrador", email: "admin@system.com" },
        { username: "manager", password: "manager123", role: "admin", name: "Manager", email: "manager@system.com" },
      ]

      const hardcodedUser = validCredentials.find(u => u.username === username && u.password === password)
      
      if (hardcodedUser) {
        adminUser = {
          id: hardcodedUser.username,
          email: hardcodedUser.email,
          username: hardcodedUser.username,
          name: hardcodedUser.name,
          role: hardcodedUser.role,
          permissions: ["dashboard", "products", "categories", "orders", "users", "carts", "ctas", "carousel", "home_categories", "legal_content", "admin_users"],
        }
      }
    }
    
    if (!adminUser) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar tokens
    const accessToken = await signAccessToken({ sub: adminUser.id, typ: "admin" }, "15m")
    const refreshToken = generateRefreshToken()

    // Set cookies
    const jar = await cookies()
    jar.set("tz_admin_access", accessToken, { ...cookieOptions(), maxAge: 60 * 15 })
    jar.set("tz_admin_refresh", refreshToken, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 30 })

    console.log(`Admin ${adminUser.username} logged in at ${new Date()}`)

    return NextResponse.json({ admin: adminUser })
  } catch (error) {
    console.error("Admin login failed", error)
    return NextResponse.json({ error: "Error en el login" }, { status: 500 })
  }
}
