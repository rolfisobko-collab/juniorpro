"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminUsers, type Permission } from "./admin-users-data"

interface Admin {
  id: string
  email: string
  username: string
  name: string
  role: "superadmin" | "admin" | "editor" | "viewer"
  permissions: Permission[]
}

interface AdminContextType {
  admin: Admin | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: Permission) => boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  console.log("[v0] AdminProvider - admin:", admin)
  console.log("[v0] AdminProvider - isLoading:", isLoading)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })

        if (!res.ok) {
          if (!cancelled) setAdmin(null)
          return
        }

        const data = (await res.json()) as { admin?: Admin }
        if (!cancelled) setAdmin(data.admin ?? null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        throw new Error("Credenciales inválidas o usuario inactivo")
      }

      const data = (await res.json()) as { admin?: Admin }
      setAdmin(data.admin ?? null)
      router.push("/panel")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setAdmin(null)
    void fetch("/api/admin/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    router.push("/admin/login")
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!admin) return false
    if (admin.role === "superadmin") return true
    return admin.permissions.includes(permission)
  }

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading, hasPermission }}>{children}</AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
