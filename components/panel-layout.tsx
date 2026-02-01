"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { AdminSidebar } from "@/components/admin-sidebar"

export function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { admin, isLoading } = useAdmin()

  useEffect(() => {
    if (!isLoading && !admin && pathname !== "/panel/login") {
      router.push("/panel/login")
    }
  }, [admin, isLoading, pathname, router])

  if (pathname === "/panel/login") {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-[#fbfcfd] ml-64">{children}</main>
    </div>
  )
}

export default PanelLayout
