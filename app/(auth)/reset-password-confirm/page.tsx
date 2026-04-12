"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/lib/firebase"

function ResetPasswordConfirmContent() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidCode, setIsValidCode] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const oobCode = searchParams.get("oobCode")

  useEffect(() => {
    const validateResetCode = async () => {
      if (!mode || !oobCode) {
        setError("Link de recuperación inválido")
        return
      }

      try {
        await verifyPasswordResetCode(auth, oobCode)
        setIsValidCode(true)
      } catch (err: any) {
        console.error("Invalid reset code:", err)
        setError("Link de recuperación inválido o expirado")
      }
    }

    validateResetCode()
  }, [mode, oobCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newPassword || !confirmPassword) {
      setError("Por favor completa todos los campos")
      return
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword)
      setIsReset(true)
      
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err.message || "Error al restablecer contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidCode && error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
        <div className="w-full max-w-md mx-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Link inválido</h1>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <Link href="/reset-password">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg">
                Solicitar nuevo link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isReset) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
        <div className="w-full max-w-md mx-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña restablecida!</h1>
            <p className="text-gray-500 text-sm mb-6">Tu contraseña fue actualizada. Serás redirigido al inicio de sesión...</p>
            <Link href="/login">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg">
                Ir al inicio de sesión
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
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">
        <div className="text-center">
          <Link href="/">
            <img src="/logo-optimized.png" alt="TechZone" className="h-24 w-auto object-contain drop-shadow-2xl mx-auto mb-8" />
          </Link>
          <h2 className="text-3xl font-bold text-white mb-3">Nueva contraseña</h2>
          <p className="text-blue-200 text-lg max-w-xs mx-auto">Creá una contraseña segura para tu cuenta</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Nueva contraseña</h1>
              <p className="text-sm text-gray-500">Ingresá tu nueva contraseña</p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl transition-all" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repetí la contraseña"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 rounded-xl transition-all" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors" tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Actualizando...</span>
                ) : "Actualizar contraseña"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
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

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordConfirmContent />
    </Suspense>
  )
}
