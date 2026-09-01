"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const slides = [
  {
    img: "/optimized/carousel/slide-1-desktop.webp",
    imgMobile: "/optimized/carousel/slide-1-mobile.webp",
    href: "/products?category=electronics&subcategory=smartphones",
    alt: "iPhone",
    bg: "#000000",
  },
  {
    img: "/optimized/carousel/slide-2-desktop.webp",
    imgMobile: "/optimized/carousel/slide-2-mobile.webp",
    href: "/search?q=DJI",
    alt: "DJI Drone",
    bg: "#0f172a",
  },
  {
    img: "/optimized/carousel/slide-3-desktop.webp",
    imgMobile: "/optimized/carousel/slide-3-mobile.webp",
    href: "/products?category=perfumes",
    alt: "Perfumes",
    bg: "#1f1524",
  },
  {
    img: "/optimized/carousel/slide-4-desktop.webp",
    imgMobile: "/optimized/carousel/slide-4-mobile.webp",
    href: "/",
    alt: "Nuestros Asesores",
    bg: "#0ea5e9",
  },
]

function SlideImage({
  slide,
  priority = false,
}: {
  slide: (typeof slides)[number]
  priority?: boolean
}) {
  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={slide.imgMobile} />
      <img
        src={slide.img}
        alt={slide.alt}
        className="h-full w-full object-cover"
        fetchPriority={priority ? "high" : "low"}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
      />
    </picture>
  )
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
    <div
      className="relative w-full overflow-hidden aspect-square sm:aspect-[16/5] md:aspect-[32/9]"
      style={{ background: slides[currentIndex].bg }}
    >
      {/* Slide 0 establece la altura natural de la imagen */}
      <Link href={slides[0].href} className={`block h-full w-full transition-opacity duration-500 ${currentIndex === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <SlideImage slide={slides[0]} priority />
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
            <SlideImage slide={slide} />
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
