"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Brand {
  id: string
  name: string
  slug: string
  image: string | null
  active: boolean
}

export function BrandsShowcase() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    const cached = sessionStorage.getItem("brands_showcase_v2")
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < 5 * 60 * 1000) { setBrands(data); return }
      } catch {}
    }
    fetch("/api/brands")
      .then(r => r.json())
      .then(d => {
        // Solo marcas con imagen cargada
        const list = (d.brands ?? []).filter((b: Brand) => b.image && b.image.trim() !== "")
        setBrands(list)
        try { sessionStorage.setItem("brands_showcase_v2", JSON.stringify({ data: list, ts: Date.now() })) } catch {}
      })
  }, [])

  if (brands.length === 0) return null

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Marcas Destacadas</h2>
            <p className="text-gray-400 text-sm mt-0.5">Encontrá productos por tu marca favorita</p>
          </div>
          <Link
            href="/search"
            className="text-sm font-medium text-[#009FE3] hover:text-[#007BB8] transition-colors hidden sm:block"
          >
            Ver todas →
          </Link>
        </div>

        {/* Scroll horizontal en mobile, wrap en desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
          {brands.map(brand => (
            <Link
              key={brand.id}
              href={`/search?brand=${encodeURIComponent(brand.name)}`}
              className="group flex-shrink-0 flex flex-col items-center gap-2 p-3 w-[90px] sm:w-[100px] rounded-2xl border border-gray-100 bg-white hover:border-[#009FE3]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={brand.image!}
                  alt={brand.name}
                  className="w-full h-full object-contain p-1.5 group-hover:scale-110 transition-transform duration-300"
                  onError={e => {
                    // Si la imagen rompe, ocultar toda la card
                    const card = (e.target as HTMLElement).closest("a")
                    if (card) card.style.display = "none"
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#009FE3] transition-colors text-center leading-tight line-clamp-2 w-full">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/search"
          className="mt-4 text-sm font-medium text-[#009FE3] hover:text-[#007BB8] transition-colors sm:hidden block text-center"
        >
          Ver todas las marcas →
        </Link>
      </div>
    </section>
  )
}
