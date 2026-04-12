"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email) {
      setError("Por favor ingresa tu email")
      setIsLoading(false)
      return
    }

    try {
      await resetPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar email de recuperación")
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
        <div className="w-full max-w-md mx-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisá tu email</h1>
            <p className="text-gray-500 text-sm mb-1">Te enviamos instrucciones a:</p>
            <p className="font-semibold text-gray-900 mb-5">{email}</p>
            <p className="text-sm text-gray-500 mb-6">Hacé click en el link del email para restablecer tu contraseña.</p>
            <Link href="/login">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 overflow-hidden">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative p-12">
        <div className="relative z-10 text-center">
          <Link href="/">
            <img src="/logo-optimized.png" alt="TechZone" className="h-24 w-auto object-contain drop-shadow-2xl mx-auto mb-8" />
          </Link>
          <h2 className="text-3xl font-bold text-white mb-3">Recuperá tu acceso</h2>
          <p className="text-blue-200 text-lg max-w-xs mx-auto">Te enviamos un link para que puedas crear una nueva contraseña</p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="flex justify-center mb-8 lg:hidden">
            <img src="/logo-optimized.png" alt="TechZone" className="h-14 w-auto object-contain drop-shadow-lg" />
          </Link>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Recuperar contraseña</h1>
              <p className="text-sm text-gray-500">Ingresá tu email y te enviamos el link de recuperación</p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="email" type="email" placeholder="tu@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl transition-all" required />
                </div>
              </div>

              <Button type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Enviando...</span>
                ) : "Enviar instrucciones"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-300/70 hover:text-blue-200 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
