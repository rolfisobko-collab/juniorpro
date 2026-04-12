"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdmin } from "@/lib/admin-context"
import { useToast } from "@/hooks/use-toast"
import { ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAdmin()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(username, password)
      toast({
        title: "Sesión iniciada",
        description: "Bienvenido al panel de administración",
      })
      router.push("/panel")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al iniciar sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#009FE3]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#009FE3]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          {/* Logo / Icono */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-[#009FE3]/20 border border-[#009FE3]/30 flex items-center justify-center mb-4">
              <ShieldCheck className="h-7 w-7 text-[#009FE3]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Panel Admin</h1>
            <p className="text-sm text-gray-400 mt-1">Acceso restringido — solo administradores</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</label>
              <input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-[#009FE3]/60 focus:ring-2 focus:ring-[#009FE3]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-[#009FE3]/60 focus:ring-2 focus:ring-[#009FE3]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-[#009FE3] hover:bg-[#0088c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#009FE3]/25 hover:shadow-[#009FE3]/40 hover:scale-[1.01] active:scale-[0.99] text-sm"
            >
              {isLoading ? "Ingresando..." : "Ingresar al panel"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            Junior Tech Zone © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
