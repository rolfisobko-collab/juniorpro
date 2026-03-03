"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const slides = [
  {
    img: "/carousel-1.png",
    href: "/products/prod_1770627714955_31_vosqjsbib",
    alt: "iPhone 17 Pro",
    bg: "#000000",
  },
  {
    img: "/carousel-2.png",
    href: "/products?category=electronics&subcategory=smartphones",
    alt: "Samsung Galaxy S26 Ultra",
    bg: "#8B8FA8",
  },
  {
    img: "/carousel-3.png",
    href: "/products?category=perfumes",
    alt: "Lattafa Perfumes",
    bg: "#1a0a0a",
  },
  {
    img: "/carousel-4.png",
    href: "/",
    alt: "Nuestros Asesores",
    bg: "#0ea5e9",
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full overflow-hidden" style={{ background: slides[currentIndex].bg }}>
      {/* Slide 0 establece la altura natural de la imagen */}
      <Link href={slides[0].href} className={`block w-full transition-opacity duration-500 ${currentIndex === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <img src={slides[0].img} alt={slides[0].alt} className="w-full h-auto block" fetchPriority="high" decoding="sync" loading="eager" />
      </Link>
      {/* Resto de slides superpuestos */}
      {slides.slice(1).map((slide, idx) => {
        const i = idx + 1
        return (
          <Link
            key={i}
            href={slide.href}
            className={`absolute inset-0 transition-opacity duration-500 ${i === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={slide.img}
              alt={slide.alt}
              className="w-full h-auto block"
              fetchPriority="low"
              decoding="async"
              loading="eager"
            />
          </Link>
        )
      })}

      {/* Prev / Next */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-lg hidden md:flex z-10"
        onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-lg hidden md:flex z-10"
        onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-3 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/70 w-3"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
