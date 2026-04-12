"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Lock, Mail, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, loginWithGoogle, loginWithFacebook, isLoading } = useAuth()

  const fillDemoUser = () => {
    setEmail("demo@techzone.com")
    setPassword("demo123")
    setError("")
    try {
      localStorage.setItem("tz_disable_auth", "1")
    } catch {
      // ignore
    }
    setShowDemoCredentials(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      return
    }

    try {
      await login(email, password)
      router.push("/")
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("VERIFY_NEEDED:")) {
        const emailToVerify = err.message.replace("VERIFY_NEEDED:", "")
        router.push(`/verify-email?email=${encodeURIComponent(emailToVerify)}`)
        return
      }
      setError("Credenciales incorrectas")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      router.push("/")
    } catch (err) {
      setError("Error al iniciar sesión con Google")
    }
  }

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 overflow-hidden">
      {/* Panel izquierdo decorativo — oculto en mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative p-12">
        <div className="relative z-10 text-center">
          <Link href="/">
            <img src="/logo-optimized.png" alt="TechZone" className="h-24 w-auto object-contain drop-shadow-2xl mx-auto mb-8" />
          </Link>
          <h2 className="text-3xl font-bold text-white mb-3">Bienvenido de vuelta</h2>
          <p className="text-blue-200 text-lg max-w-xs mx-auto">Accedé a tu cuenta y seguí comprando los mejores productos tech</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <Link href="/" className="flex justify-center mb-8 lg:hidden">
            <img src="/logo-optimized.png" alt="TechZone" className="h-14 w-auto object-contain drop-shadow-lg" />
          </Link>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
              <p className="text-sm text-gray-500">Ingresá tu email y contraseña para continuar</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Contraseña</Label>
                  <Link href="/reset-password" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Iniciando sesión...</span>
                ) : "Iniciar sesión"}
              </Button>
            </form>

            <div className="mt-5 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400 uppercase tracking-widest font-medium">O continuá con</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 border-2 border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 group"
              >
                <svg className="mr-2.5 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿No tenés cuenta?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Registrate gratis
              </Link>
            </p>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-300/70 hover:text-blue-200 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
