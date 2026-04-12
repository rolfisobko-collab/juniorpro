"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShoppingCart, Heart, User, Search, Menu, ChevronDown, ArrowRight, Grid3x3, X, Home, Package, Tag, HelpCircle, Phone } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"
import { LanguageCurrencySelector } from "./language-currency-selector"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getCategories, getCategoriesSync } from "@/lib/categories-data"
import { BrandingLogo } from "./branding-logo"
import { colors } from "@/lib/colors"
import { useTranslation } from "@/lib/i18n/translation-provider"

export function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { favorites } = useFavorites()
  const { t, language } = useTranslation()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState(getCategoriesSync())

  // Cargar categorías desde la API al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setSidebarOpen(false)
    }
  }

  const visibleCategories = categories.slice(0, 3)
  const hasMoreCategories = categories.length > 3

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        {/* Barra superior oscura */}
        <div className="bg-[#0a0f1e] border-b border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex h-[42px] items-center justify-between">
              <p className="text-xs text-gray-400 hidden md:block">
                ✦ Ciudad del Este, Paraguay &nbsp;·&nbsp; Lunes a Sábado 8:00 – 18:00
              </p>
              <div className="flex items-center gap-4 ml-auto">
                <LanguageCurrencySelector />
                {!user && (
                  <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">
                    Iniciar sesión
                  </Link>
                )}
                {user && user.name && (
                  <span className="text-xs text-gray-400">Hola, <span className="text-[#009FE3] font-medium">{user.name.split(" ")[0]}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barra principal */}
        <div className="bg-white/[0.98] backdrop-blur-xl border-b border-gray-200/80 shadow-[0_1px_20px_rgba(0,0,0,0.08)]">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between gap-4">

              {/* Mobile: hamburger + logo */}
              <div className="flex items-center gap-3 md:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <BrandingLogo href="/" variant="header" className="shrink-0" />
              </div>

              {/* Desktop: logo */}
              <div className="hidden md:flex items-center">
                <BrandingLogo href="/" variant="header" className="shrink-0" />
              </div>

              {/* Buscador desktop */}
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center max-w-xl mx-6">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={language === 'pt' ? 'Pesquisar produtos, marcas...' : 'Buscar productos, marcas...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-[#009FE3] focus:ring-2 focus:ring-[#009FE3]/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 bg-[#009FE3] hover:bg-[#0088c7] text-white text-xs font-semibold rounded-lg transition-colors">
                    {t('Search')}
                  </button>
                </div>
              </form>

              {/* Acciones desktop */}
              <div className="hidden md:flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="h-10 px-3 rounded-xl flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <Grid3x3 className="h-4 w-4" />
                  <span>{t('Categories')}</span>
                </button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <Link href="/favorites">
                  <button className="relative h-10 w-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all">
                    <Heart className="h-5 w-5" />
                    {favorites.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </Link>

                <Link href="/cart">
                  <button className="relative h-10 w-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all" data-cart-button>
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#009FE3] text-white text-[10px] flex items-center justify-center font-bold">
                        {itemCount}
                      </span>
                    )}
                  </button>
                </Link>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-1 h-10 px-2 rounded-xl flex items-center gap-2 hover:bg-gray-100 transition-all">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-[#009FE3]/30" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-[#009FE3]/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-[#009FE3]" />
                          </div>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 shadow-xl border border-gray-200 rounded-2xl p-1">
                      <DropdownMenuLabel className="rounded-xl">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="rounded-lg"><Link href="/profile">{t('Profile')}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg"><Link href="/mis-pedidos">{t('My Orders')}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg"><Link href="/favorites">{t('My Favorites')}</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-500 rounded-lg focus:text-red-500 focus:bg-red-50">{t('Logout')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login" className="ml-1">
                    <button className="h-9 px-4 bg-[#009FE3] hover:bg-[#0088c7] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                      {t('Login')}
                    </button>
                  </Link>
                )}
              </div>

              {/* Mobile: carrito */}
              <div className="flex items-center gap-2 md:hidden">
                <Link href="/cart">
                  <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" data-cart-button>
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#009FE3] text-white text-[10px] flex items-center justify-center font-bold">
                        {itemCount}
                      </span>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-0 z-[60] ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed left-0 top-0 h-full w-[300px] sm:w-[340px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* Header sidebar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <BrandingLogo href="/" variant="header" className="shrink-0" />
            <button onClick={() => setSidebarOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Buscador mobile */}
          <form onSubmit={handleSearch} className="px-4 py-3 border-b border-gray-100 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={language === 'pt' ? 'Pesquisar produtos...' : 'Buscar productos...'}
                className="pl-9 h-10 bg-gray-50 border-gray-200 rounded-xl text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Configuración mobile */}
          <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
            <LanguageCurrencySelector />
          </div>

          {/* Categorías */}
          <div className="flex-1 overflow-y-auto py-3">
            <p className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('Categories')}</p>
            <Link href="/products" onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#009FE3] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#009FE3]/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-[#009FE3]" />
                </div>
                {t('All Products')}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#009FE3] group-hover:translate-x-1 transition-all" />
            </Link>

            {categories.map((category) => (
              <div key={category.slug}>
                <Link href={`/products?category=${category.slug}`} onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#009FE3] transition-colors group"
                >
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-gray-100 group-hover:bg-blue-100 group-hover:text-[#009FE3] px-1.5 py-0.5 rounded-full transition-colors">
                      {category.subcategories.length}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#009FE3] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
                {category.subcategories.slice(0, 4).map((sub) => (
                  <Link key={sub.slug} href={`/products?category=${category.slug}&subcategory=${sub.slug}`} onClick={() => setSidebarOpen(false)}
                    className="block text-xs text-gray-500 hover:text-[#009FE3] transition-colors py-1.5 pl-[60px] pr-5 hover:bg-blue-50/50"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Footer sidebar mobile */}
          <div className="border-t border-gray-100 p-4 space-y-2 sm:hidden">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl mb-2">
                  <div className="h-8 w-8 rounded-full bg-[#009FE3]/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-[#009FE3]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/mis-pedidos" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <Package className="h-4 w-4 text-gray-400" /> {t('My Orders')}
                </Link>
                <Link href="/favorites" onClick={() => setSidebarOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><Heart className="h-4 w-4 text-gray-400" /> {t('Favorites')}</div>
                  {favorites.length > 0 && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">{favorites.length}</span>}
                </Link>
                <button onClick={() => { logout(); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                  {t('Logout')}
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setSidebarOpen(false)}>
                <button className="w-full h-11 bg-[#009FE3] hover:bg-[#0088c7] text-white text-sm font-semibold rounded-xl transition-colors">
                  {t('Login')}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
