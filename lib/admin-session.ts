import { cookies } from "next/headers"

import { verifyAccessToken } from "@/lib/auth-server"

export async function requireAdminId() {
  const jar = await cookies()
  const token = jar.get("tz_admin_access")?.value
  if (!token) return null

  try {
    const payload = await verifyAccessToken(token)
    if (payload.typ !== "admin" || typeof payload.sub !== "string") return null
    return payload.sub
  } catch {
    return null
  }
}
