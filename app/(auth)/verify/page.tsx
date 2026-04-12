"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, AlertCircle, Loader2 } from "lucide-react"
import { getAuth, applyActionCode, checkActionCode } from "firebase/auth"
import { auth } from "@/lib/firebase"

function VerifyEmailContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const oobCode = searchParams.get("oobCode")
  const continueUrl = searchParams.get("continueUrl")

  useEffect(() => {
    const handleEmailVerification = async () => {
      if (!mode || !oobCode) {
        setError("Link de verificación inválido")
        setIsLoading(false)
        return
      }

      try {
        if (mode === "verifyEmail") {
          // Aplicar verificación de email
          await applyActionCode(auth, oobCode)
          setIsVerified(true)
          
          // Recargar el usuario para obtener el estado actualizado
          await auth.currentUser?.reload()
          
          setTimeout(() => {
            router.push(continueUrl || "/")
          }, 3000)
        } else if (mode === "resetPassword") {
          // Redirigir a página de reset con el código
          router.push(`/reset-password?mode=resetPassword&oobCode=${oobCode}`)
        } else {
          setError("Modo no soportado")
        }
      } catch (err: any) {
        console.error("Email verification error:", err)
        setError(err.message || "Error al verificar email")
      } finally {
        setIsLoading(false)
      }
    }

    handleEmailVerification()
  }, [mode, oobCode, continueUrl, router])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Verificando email...</h2>
          <p className="text-blue-200 mt-2">Por favor esperá un momento</p>
        </div>
      </div>
    )
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
            <p className="text-gray-500 text-sm mb-6">Tu cuenta ha sido activada exitosamente. Serás redirigido automáticamente...</p>
            <Link href="/">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg">
                Ir al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
      <div className="w-full max-w-md mx-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de verificación</h1>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg">
                Ir al inicio de sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full h-11 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-blue-400">
                Crear una cuenta
              </Button>
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
