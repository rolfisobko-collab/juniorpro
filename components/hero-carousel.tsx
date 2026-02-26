"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/translation-provider"

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { language } = useTranslation()

  // Imágenes según el idioma
  const slides = language === "pt" ? [
    {
      desktop: "https://i.ibb.co/Y7p9b4Tm/1.png",
      mobile: "https://i.ibb.co/tTR7n8sz/1-2.png"
    },
    {
      desktop: "https://i.ibb.co/ZRc2Jz96/2.png", 
      mobile: "https://i.ibb.co/DHQ3cNnn/2-1.png"
    },
    {
      desktop: "https://i.ibb.co/Rk4J5jZ1/3.png",
      mobile: "https://i.ibb.co/KxZWk17y/3-1.png"
    },
    {
      desktop: "https://i.ibb.co/HT3WHPRr/4.png",
      mobile: "https://i.ibb.co/QF08DNMF/4-1.png"
    },
    {
      desktop: "https://i.ibb.co/3mtb8wgC/5.png",
      mobile: "https://i.ibb.co/8qK2cR6G/5-1.png"
    }
  ] : [
    {
      desktop: "https://i.ibb.co/Y7p9b4Tm/1.png",
      mobile: "https://i.ibb.co/tTR7n8sz/1-2.png"
    },
    {
      desktop: "https://i.ibb.co/ZRc2Jz96/2.png", 
      mobile: "https://i.ibb.co/DHQ3cNnn/2-1.png"
    },
    {
      desktop: "https://i.ibb.co/Rk4J5jZ1/3.png",
      mobile: "https://i.ibb.co/KxZWk17y/3-1.png"
    },
    {
      desktop: "https://i.ibb.co/HT3WHPRr/4.png",
      mobile: "https://i.ibb.co/QF08DNMF/4-1.png"
    },
    {
      desktop: "https://i.ibb.co/3mtb8wgC/5.png",
      mobile: "https://i.ibb.co/8qK2cR6G/5-1.png"
    }
  ]

  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  // Reset index when language changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [language])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[37vh] lg:h-[40vh] overflow-hidden">
      {/* Preload all slide images */}
      <div className="hidden" aria-hidden="true">
        {slides.map((slide, i) => i > 0 && (
          <div key={i}>
            <img src={slide.desktop} alt="" fetchPriority="low" />
            <img src={slide.mobile} alt="" fetchPriority="low" />
          </div>
        ))}
      </div>

      {/* Render all slides, show only current with opacity transition */}
      <div className="relative w-full h-full">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${i === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={slide.desktop}
              alt={`Slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-contain object-center hidden md:block"
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
            />
            <img
              src={slide.mobile}
              alt={`Slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center md:hidden"
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      {slides.length > 1 && (
        <>
          {/* Botones anterior/siguiente */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-lg hidden md:flex"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-lg hidden md:flex"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicadores */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
