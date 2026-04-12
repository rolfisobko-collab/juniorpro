export const dynamic = "auto" // cookies() hace la página dinámica automáticamente

import { Button } from "@/components/ui/button"
import { defaultCTAs } from "@/lib/ctas-data"
import { HeroCarousel } from "@/components/hero-carousel"
import { getActiveHomeCategories } from "@/lib/home-categories-data"
import { HomeBestSellers, HomeAppliances, HomeNewArrivals } from "@/components/homepage-products-static"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Truck, Zap, Award } from "lucide-react"
import { getServerT } from "@/lib/i18n/get-server-lang"

export default async function HomePage() {
  const { t, lang } = await getServerT()
  const activeCTAs = defaultCTAs.filter((cta) => cta.isActive).sort((a, b) => a.position - b.position)
  const homeCategories = getActiveHomeCategories()

  return (
    <div className="min-h-screen">
      <HeroCarousel />

      {/* Categorías */}
      {homeCategories.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-[#009FE3] uppercase tracking-[0.2em] mb-1.5">{t('Explore by Categories')}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t('Explore by Categories')}</h2>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-[#009FE3] transition-colors">
                {t('View more')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {homeCategories.map((category: any) => (
                <Link
                  key={category.key || category.id}
                  href={category.link}
                  className="group flex flex-col items-center gap-2.5 w-24 sm:w-28 md:w-[7.5rem]"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 ring-2 ring-transparent group-hover:ring-[#009FE3]/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#009FE3]/10">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                      priority={category.order <= 6}
                      loading={category.order <= 6 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <p className="text-xs sm:text-[13px] font-semibold text-gray-700 group-hover:text-[#009FE3] text-center transition-colors leading-tight">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features bar */}
      <section className="py-0 bg-[#0a0f1e]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {[
              { icon: Truck, label: t('Fast Delivery'), sub: t('Same day shipping'), accent: "#009FE3" },
              { icon: ShieldCheck, label: t('Official Warranty'), sub: t('Up to 30 days'), accent: "#10b981" },
              { icon: Zap, label: t('Secure Payment'), sub: "Bancard", accent: "#f59e0b" },
              { icon: Award, label: t('Expert Support'), sub: t('24/7 assistance'), accent: "#a855f7" },
            ].map(({ icon: Icon, label, sub, accent }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-5">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}18` }}>
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeBestSellers title={t('Best Sellers')} />

      <HomeAppliances title={lang === 'pt' ? 'Eletrodomésticos em Destaque' : 'Electrodomésticos Destacados'} />

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
                  {lang === 'pt' ? (activeCTAs[0].title_pt || activeCTAs[0].title) : activeCTAs[0].title}
                </h2>
                <p
                  className="text-lg md:text-xl lg:text-2xl opacity-95 text-pretty max-w-lg drop-shadow-md"
                  style={{ color: activeCTAs[0].textColor || "#ffffff" }}
                >
                  {lang === 'pt' ? (activeCTAs[0].description_pt || activeCTAs[0].description) : activeCTAs[0].description}
                </p>
                <Button
                  size="lg"
                  className="mt-6 h-14 px-10 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 border-2 border-yellow-600"
                >
                  {lang === 'pt' ? (activeCTAs[0].buttonText_pt || activeCTAs[0].buttonText) : activeCTAs[0].buttonText}
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

      <HomeNewArrivals title={t('New Arrivals')} />
    </div>
  )
}
