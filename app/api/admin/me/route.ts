import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/auth-server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const jar = await cookies()
    const token = jar.get("tz_admin_access")?.value
    if (!token) return NextResponse.json({ admin: null }, { status: 401 })

    const payload = await verifyAccessToken(token)
    if (payload.typ !== "admin" || typeof payload.sub !== "string") {
      return NextResponse.json({ admin: null }, { status: 401 })
    }

    // Primero buscar en la base de datos (usuarios creados desde el panel)
    let adminUser = null
    try {
      const dbAdmin = await prisma.adminUser.findUnique({
        where: { id: payload.sub }
      })
      
      if (dbAdmin && dbAdmin.active) {
        adminUser = {
          id: dbAdmin.id,
          email: dbAdmin.email,
          username: dbAdmin.username,
          name: dbAdmin.name,
          role: dbAdmin.role,
          permissions: dbAdmin.permissions,
          active: dbAdmin.active,
          lastLogin: dbAdmin.lastLogin?.toISOString() || null,
        }
      }
    } catch (dbError) {
      console.log("DB search failed, trying hardcoded users")
    }

    // Si no encuentra en BD, buscar en hardcoded (fallback)
    if (!adminUser) {
      const validCredentials = [
        { username: "admin", password: "admin2346", role: "superadmin", name: "Administrador", email: "admin@system.com" },
        { username: "manager", password: "manager123", role: "admin", name: "Manager", email: "manager@system.com" },
      ]

      const hardcodedUser = validCredentials.find(u => u.username === payload.sub)
      
      if (hardcodedUser) {
        adminUser = {
          id: hardcodedUser.username,
          email: hardcodedUser.email,
          username: hardcodedUser.username,
          name: hardcodedUser.name,
          role: hardcodedUser.role,
          permissions: ["dashboard", "products", "categories", "orders", "users", "carts", "ctas", "carousel", "home_categories", "legal_content", "admin_users"],
          active: true,
          lastLogin: new Date().toISOString(),
        }
      }
    }
    
    if (!adminUser) {
      return NextResponse.json({ admin: null }, { status: 401 })
    }

    return NextResponse.json({ admin: adminUser })
  } catch (error) {
    console.error("Admin me failed", error)
    return NextResponse.json({ admin: null }, { status: 401 })
  }
}
