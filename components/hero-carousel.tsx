"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const slides = [
  {
    img: "https://iili.io/qBpfMKv.png",
    href: "/products/prod_1770627714955_31_vosqjsbib",
    alt: "iPhone 17 Pro",
    bg: "#000000",
  },
  {
    img: "https://iili.io/qBpfb0x.png",
    href: "/products?category=electronics&subcategory=smartphones",
    alt: "Samsung Galaxy S26 Ultra",
    bg: "#8B8FA8",
  },
  {
    img: "https://iili.io/qBpq2zF.png",
    href: "/products?category=perfumes",
    alt: "Lattafa Perfumes",
    bg: "#1a0a0a",
  },
]

// Preload all images before anything renders
if (typeof window !== "undefined") {
  slides.forEach((s, i) => {
    const img = new window.Image()
    img.fetchPriority = i === 0 ? "high" : "auto"
    img.src = s.img
  })
}

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1024/360", background: slides[currentIndex].bg }}>
      {slides.map((slide, i) => (
        <Link
          key={i}
          href={slide.href}
          className={`absolute inset-0 transition-opacity duration-500 ${i === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img
            src={slide.img}
            alt={slide.alt}
            className="w-full h-full object-cover object-center"
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? "sync" : "async"}
            loading="eager"
          />
        </Link>
      ))}

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
