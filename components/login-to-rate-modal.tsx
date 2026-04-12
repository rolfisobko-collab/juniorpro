"use client"

import { useEffect } from "react"
import { X, Star, LogIn } from "lucide-react"
import Link from "next/link"
import { BrandingLogo } from "./branding-logo"

interface LoginToRateModalProps {
  open: boolean
  onClose: () => void
}

export function LoginToRateModal({ open, onClose }: LoginToRateModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Logo */}
        <BrandingLogo href="/" variant="header" />

        {/* Icono estrellas */}
        <div className="flex gap-1">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Texto */}
        <div className="text-center space-y-1.5">
          <p className="text-lg font-bold text-gray-900">Iniciá sesión para puntuar</p>
          <p className="text-sm text-gray-500">Tu opinión ayuda a otros compradores a elegir mejor.</p>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2.5 w-full pt-1">
          <Link
            href="/auth/login"
            className="w-full bg-[#009FE3] hover:bg-[#0088c7] text-white text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            onClick={onClose}
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-3 rounded-2xl flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            Crear cuenta gratis
          </Link>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors pt-1"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
