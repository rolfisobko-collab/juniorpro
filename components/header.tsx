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

export function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { favorites } = useFavorites()
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
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-lg transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Menú Categorías y Logo - Mobile */}
            <div className="flex items-center gap-3 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-blue-50 hover:scale-110 transition-all"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir categorías</span>
              </Button>
              <BrandingLogo href="/" variant="header" className="shrink-0" />
            </div>

            {/* Logo - Desktop */}
            <div className="hidden md:flex items-center">
              <BrandingLogo href="/" variant="header" className="shrink-0" />
            </div>

            {/* Buscador - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-4">
              <div className="relative w-full">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 px-5 pr-12 text-base bg-gradient-to-r from-white to-gray-50/80 border border-gray-200/60 backdrop-blur-sm rounded-full focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-300/50 focus:shadow-lg focus:shadow-blue-200/30 transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300/80 placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-blue-400/30"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Acciones - Desktop */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Menú Categorías - Desktop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-blue-50 hover:scale-110 transition-all"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir categorías</span>
              </Button>
              
              <LanguageCurrencySelector />
              
              <Link href="/favorites">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-blue-50 hover:scale-110 transition-all"
                >
                  <Heart className="h-5 w-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {favorites.length}
                    </span>
                  )}
                  <span className="sr-only">Favoritos</span>
                </Button>
              </Link>

              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-blue-50 hover:scale-110 transition-all"
                  data-cart-button
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {itemCount}
                    </span>
                  )}
                  <span className="sr-only">Carrito</span>
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:scale-110 transition-all relative">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="sr-only">Menú de usuario</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Mis Pedidos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites">Favoritos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-blue-500/20 font-semibold"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>

            {/* Acciones Mobile - Solo carrito */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-blue-50"
                  data-cart-button
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                  <span className="sr-only">Carrito</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Desplegable - Responsive */}
      <div 
        className={`fixed inset-0 z-50 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-all duration-300 ease-in-out`}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar - Responsive */}
        <div 
          className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-2xl transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                     w-[280px] sm:w-[320px] lg:w-[350px]`}
        >
          <div className="flex flex-col h-full">
            {/* Header del Sidebar - Responsive */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <BrandingLogo href="/" variant="header" className="shrink-0" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-blue-50 transition-colors h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Cerrar menú</span>
              </Button>
            </div>

            {/* Contenido del Sidebar - Responsive */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Buscador en sidebar - Mobile */}
              <form onSubmit={handleSearch} className="relative mb-6 sm:hidden">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Selector de idioma/moneda - Mobile */}
              <div className="mb-6 sm:hidden">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-600">Configuración</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-1">
                  <LanguageCurrencySelector />
                </div>
              </div>

              {/* Categorías - Responsive */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4 px-2">TODAS LAS CATEGORÍAS</h3>
                <div className="space-y-2 sm:space-y-3">
                  {/* Link a todos los productos */}
                  <Link
                    href="/products"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-500" />
                      <span className="font-medium group-hover:text-blue-500 transition-colors">Todos los Productos</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </Link>

                  {categories.map((category) => (
                    <div key={category.slug} className="space-y-2">
                      <Link
                        href={`/products?category=${category.slug}`}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <span className="font-medium group-hover:text-blue-500 transition-colors">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {category.subcategories.length}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </Link>
                      <div className="pl-6 space-y-1">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                            onClick={() => setSidebarOpen(false)}
                            className="block text-sm text-gray-500 hover:text-blue-500 transition-all duration-200 py-2 px-3 rounded-md hover:bg-blue-50"
                          >
                            • {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del Sidebar - Mobile */}
            <div className="border-t border-gray-200 p-4 sm:hidden">
              <div className="space-y-2">
                {/* Usuario/Login */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                          <span className="font-medium group-hover:text-blue-500 transition-colors">Mi Cuenta</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 ml-3">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" onClick={() => setSidebarOpen(false)}>Mi Perfil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" onClick={() => setSidebarOpen(false)}>Mis Pedidos</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites" onClick={() => setSidebarOpen(false)}>Favoritos</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { logout(); setSidebarOpen(false); }} className="text-red-600">
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login" onClick={() => setSidebarOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="font-medium group-hover:text-blue-500 transition-colors">Iniciar Sesión</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </Button>
                  </Link>
                )}

                <Link
                  href="/favorites"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-gray-500" />
                    <span className="font-medium group-hover:text-blue-500 transition-colors">Favoritos</span>
                  </div>
                  {favorites.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                    <span className="font-medium group-hover:text-blue-500 transition-colors">Carrito</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
