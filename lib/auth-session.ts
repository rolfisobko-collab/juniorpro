import { cookies } from "next/headers"

import { verifyAccessToken } from "@/lib/auth-server"

export async function requireUserId() {
  const jar = await cookies()
  const token = jar.get("tz_access")?.value
  if (!token) return null

  try {
    const payload = await verifyAccessToken(token)
    if (payload.typ !== "user" || typeof payload.sub !== "string") return null
    return payload.sub
  } catch {
    return null
  }
}
