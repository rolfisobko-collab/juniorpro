"use client"

import { Button } from "@/components/ui/button"
import HomepageProducts from "@/components/homepage-products"
import { carouselSlides } from "@/lib/carousel-data"
import { defaultCTAs } from "@/lib/ctas-data"
import { HeroCarousel } from "@/components/hero-carousel"
import { getActiveHomeCategories } from "@/lib/home-categories-data"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Truck, Zap, Package, Award } from "lucide-react"
import { useTranslation } from "@/lib/i18n/translation-provider"

export default function HomePage() {
  const { t, language } = useTranslation()
  const activeCTAs = defaultCTAs.filter((cta) => cta.isActive).sort((a, b) => a.position - b.position)
  const homeCategories = getActiveHomeCategories()

  return (
    <div className="min-h-screen">
      <HeroCarousel />

      {homeCategories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-gray-800">{t('Explore by Categories')}</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {t('Discover our wide selection of products organized by categories')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeCategories.map((category: any) => (
                <Link
                  key={category.key || category.id}
                  href={`/products?category=${category.key || category.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-blue-500 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <HomepageProducts 
        title={t('Recommended for You')} 
        limit={5}
        featured={true}
      />

      <section className="py-8 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-purple-400/20 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <Zap className="h-7 w-7 text-white relative z-10" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{t('Tech Premium')}</p>
                <p className="text-xs text-gray-600">{t('Latest technology')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-blue-400/20 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <ShieldCheck className="h-7 w-7 text-white relative z-10" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{t('Official Warranty')}</p>
                <p className="text-xs text-gray-600">{t('Up to 2 years')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-green-400/20 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <Truck className="h-7 w-7 text-white relative z-10" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{t('Fast Delivery')}</p>
                <p className="text-xs text-gray-600">{t('Same day shipping')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-orange-400/20 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <Package className="h-7 w-7 text-white relative z-10" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{t('Secure Payment')}</p>
                <p className="text-xs text-gray-600">{t('Card & crypto')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-pink-400/20 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <Award className="h-7 w-7 text-white relative z-10" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{t('Expert Support')}</p>
                <p className="text-xs text-gray-600">{t('24/7 assistance')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-indigo-400/20 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="h-7 w-7 text-white relative z-10 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-10-5z"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{t('Buyer Protection')}</p>
                <p className="text-xs text-gray-600">{t('30 days return')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomepageProducts 
        title={t('New Arrivals')} 
        limit={5}
      />

      {activeCTAs.length > 0 && activeCTAs[0] && (
        <section className="py-0 relative overflow-hidden">
          <Link
            href={activeCTAs[0].buttonLink || "/products"}
            className="group relative overflow-hidden block w-full"
            style={{ backgroundColor: activeCTAs[0].backgroundColor || "#1e40af" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 z-0" />
            <div className="grid md:grid-cols-2 items-center min-h-[400px] md:min-h-[500px] relative z-10">
              <div className="p-8 md:p-16 lg:pl-[10%] space-y-6 z-10 relative">
                <h2
                  className="text-4xl md:text-5xl lg:text-7xl font-bold text-balance leading-tight drop-shadow-lg"
                  style={{ color: activeCTAs[0].textColor || "#ffffff" }}
                >
                  {language === "pt" ? activeCTAs[0].title_pt || activeCTAs[0].title : activeCTAs[0].title}
                </h2>
                <p
                  className="text-lg md:text-xl lg:text-2xl opacity-95 text-pretty max-w-lg drop-shadow-md"
                  style={{ color: activeCTAs[0].textColor || "#ffffff" }}
                >
                  {language === "pt" ? activeCTAs[0].description_pt || activeCTAs[0].description : activeCTAs[0].description}
                </p>
                <Button
                  size="lg"
                  className="mt-6 h-14 px-10 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 border-2 border-yellow-600"
                >
                  {language === "pt" ? activeCTAs[0].buttonText_pt || activeCTAs[0].buttonText : activeCTAs[0].buttonText}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className="relative h-[400px] md:h-[500px] overflow-hidden p-8">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 md:hidden" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={activeCTAs[0].imageDesktop || "/placeholder.svg"}
                    alt={activeCTAs[0].title}
                    fill
                    className="object-contain hidden md:block group-hover:scale-110 transition-transform duration-700"
                  />
                  <Image
                    src={activeCTAs[0].imageMobile || "/placeholder.svg"}
                    alt={activeCTAs[0].title}
                    fill
                    className="object-contain md:hidden group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      <HomepageProducts 
        title={t('Best Sellers')} 
        limit={5}
      />
    </div>
  )
}
