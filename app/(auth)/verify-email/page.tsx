"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chrome, Mail, ArrowLeft, CheckCircle } from "lucide-react"

function VerifyEmailContent() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [resendMessage, setResendMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!code || code.length !== 6) {
      setError("El código debe tener 6 dígitos")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Código inválido")
      }

      setIsVerified(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar el código")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setResendMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar el código")
      }

      setResendMessage(`Código enviado a ${email}`)
      if (data.devCode) {
        setResendMessage(prev => `${prev} (Código de desarrollo: ${data.devCode})`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reenviar el código")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
        <div className="w-full max-w-md mx-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Email verificado!</h1>
            <p className="text-gray-500 text-sm mb-6">Tu cuenta fue activada. Serás redirigido automáticamente...</p>
            <Button onClick={() => router.push("/")}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg">
              Ir al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 overflow-hidden">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">
        <div className="relative z-10 text-center">
          <Link href="/">
            <img src="/logo-optimized.png" alt="TechZone" className="h-24 w-auto object-contain drop-shadow-2xl mx-auto mb-8" />
          </Link>
          <div className="w-20 h-20 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-blue-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Verificá tu email</h2>
          <p className="text-blue-200 text-lg max-w-xs mx-auto">Te enviamos un código de 6 dígitos a tu correo</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Verificá tu email</h1>
              <p className="text-sm text-gray-500">
                Enviamos un código a <span className="font-semibold text-gray-800">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm font-semibold text-gray-700">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-2xl font-mono h-14 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl tracking-[0.5em] transition-all"
                  required
                />
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {resendMessage && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm">{resendMessage}</p>
                </div>
              )}

              <Button type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || code.length !== 6}>
                {isLoading ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Verificando...</span>
                ) : "Verificar email"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500 mb-2">¿No recibiste el código?</p>
              <button onClick={handleResend} disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors disabled:opacity-50">
                {isLoading ? "Enviando..." : "Reenviar código"}
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-blue-300/70 hover:text-blue-200 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
