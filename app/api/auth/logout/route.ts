import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { cookieOptions } from "@/lib/auth-server"

export async function POST() {
  const jar = await cookies()
  jar.set("tz_access", "", { ...cookieOptions(), maxAge: 0 })
  jar.set("tz_refresh", "", { ...cookieOptions(), maxAge: 0 })
  return NextResponse.json({ ok: true })
}
