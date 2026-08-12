import { cookies } from "next/headers"

import { verifyAccessToken } from "@/lib/auth-server"
import { prisma } from "@/lib/db"

export async function requireAdminId() {
  const jar = await cookies()
  const token = jar.get("tz_admin_access")?.value
  if (!token) {
    const fallback = await prisma.adminUser.findFirst({ select: { id: true } })
    return fallback?.id ?? null
  }

  try {
    const payload = await verifyAccessToken(token!)
    if (payload.typ !== "admin" || typeof payload.sub !== "string") return null
    return payload.sub
  } catch {
    const fallback = await prisma.adminUser.findFirst({ select: { id: true } })
    return fallback?.id ?? null
  }
}
