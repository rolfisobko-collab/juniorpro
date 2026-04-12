"use client"

import Link from "next/link"
import { useState } from "react"

interface BrandFilterItemProps {
  brand: { id: string; name: string; image: string | null }
  isActive: boolean
  href: string
}

export function BrandFilterItem({ brand, isActive, href }: BrandFilterItemProps) {
  const [imgError, setImgError] = useState(false)

  // Si no tiene imagen o la imagen falla, no renderizar
  if (!brand.image || imgError) return null

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        isActive
          ? "bg-gray-900 text-white border-gray-900"
          : "border-gray-200 text-gray-600 hover:border-gray-400"
      }`}
    >
      <img
        src={brand.image}
        alt={brand.name}
        className="h-4 w-4 object-contain rounded-sm flex-shrink-0"
        onError={() => setImgError(true)}
      />
      {brand.name}
    </Link>
  )
}
