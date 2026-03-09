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
    const cached = sessionStorage.getItem("brands_showcase")
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < 5 * 60 * 1000) { setBrands(data); return }
      } catch {}
    }
    fetch("/api/brands")
      .then(r => r.json())
      .then(d => {
        const list = d.brands ?? []
        setBrands(list)
        try { sessionStorage.setItem("brands_showcase", JSON.stringify({ data: list, ts: Date.now() })) } catch {}
      })
  }, [])

  if (brands.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Nuestras Marcas</h2>
          <p className="text-gray-500 mt-2 text-sm">Descubrí productos por tu marca favorita</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {brands.map(brand => (
            <Link
              key={brand.id}
              href={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                    onError={e => {
                      const el = e.target as HTMLImageElement
                      el.style.display = "none"
                      el.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : null}
                <span className={`${brand.image ? "hidden" : ""} text-2xl font-black text-gray-200 group-hover:text-blue-200 transition-colors`}>
                  {brand.name.charAt(0)}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors text-center leading-tight line-clamp-2">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
