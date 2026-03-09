"use client"

import { useEffect, useRef, useState } from "react"
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
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem("brands_showcase_v3")
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < 5 * 60 * 1000) { setBrands(data); return }
      } catch {}
    }
    fetch("/api/brands")
      .then(r => r.json())
      .then(d => {
        const list = (d.brands ?? []).filter((b: Brand) => b.image && b.image.trim() !== "")
        setBrands(list)
        try { sessionStorage.setItem("brands_showcase_v3", JSON.stringify({ data: list, ts: Date.now() })) } catch {}
      })
  }, [])

  if (brands.length === 0) return null

  // Duplicar para scroll infinito
  const doubled = [...brands, ...brands]

  return (
    <section className="py-10 bg-white border-y border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Marcas Destacadas</h2>
            <p className="text-gray-400 text-sm mt-0.5">Encontrá productos de tus marcas favoritas</p>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-[#009FE3] hover:text-[#007BB8] transition-colors"
          >
            Ver todo →
          </Link>
        </div>
      </div>

      {/* Marquee container — fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]"
          style={{ animationDuration: `${Math.max(20, brands.length * 3)}s` }}
        >
          {doubled.map((brand, i) => (
            <Link
              key={`${brand.id}-${i}`}
              href={`/search?brand=${encodeURIComponent(brand.name)}`}
              className="group flex-shrink-0 flex flex-col items-center gap-2 p-4 w-[110px] rounded-2xl border border-gray-100 bg-white hover:border-[#009FE3]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={brand.image!}
                  alt={brand.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  onError={e => {
                    const card = (e.target as HTMLElement).closest("a")
                    if (card) (card as HTMLElement).style.display = "none"
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#009FE3] transition-colors text-center leading-tight line-clamp-2 w-full">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </section>
  )
}
