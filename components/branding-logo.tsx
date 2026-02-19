"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getBrandingConfig, type BrandingConfig } from "@/lib/branding-data"

interface BrandingLogoProps {
  href?: string
  variant?: "header" | "sidebar" | "footer"
  className?: string
}

export function BrandingLogo({ href = "/", variant = "header", className = "" }: BrandingLogoProps) {
  const [branding, setBranding] = useState<BrandingConfig | null>(null)

  useEffect(() => {
    setBranding(getBrandingConfig())

    const handleBrandingUpdate = () => {
      setBranding(getBrandingConfig())
    }

    window.addEventListener("branding-updated", handleBrandingUpdate)
    return () => window.removeEventListener("branding-updated", handleBrandingUpdate)
  }, [])

  if (!branding) return null

  const isSidebar = variant === "sidebar"

  return (
    <Link href={href} className={`flex items-center justify-center group ${className}`}>
      {branding.logoImage ? (
        <img
          src={branding.logoImage || "/placeholder.svg"}
          alt={branding.siteName}
          className={`${isSidebar ? "h-10 w-auto" : "h-12 w-auto"} object-contain rounded-lg group-hover:scale-110 transition-transform`}
        />
      ) : (
        <div
          className={`${isSidebar ? "h-8 w-8" : "h-10 w-10"} rounded-xl ${isSidebar ? "bg-primary" : "bg-gradient-to-br from-primary via-primary to-blue-600"} flex items-center justify-center ${isSidebar ? "" : "shadow-xl"} group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300`}
        >
          <span className={`text-primary-foreground font-bold ${isSidebar ? "text-lg" : "text-xl"}`}>
            {branding.logoText}
          </span>
        </div>
      )}
    </Link>
  )
}
