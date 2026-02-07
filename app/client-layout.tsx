"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { AdminProvider } from "@/lib/admin-context"
import { CartProvider } from "@/lib/cart-context"
import { FavoritesProvider } from "@/lib/favorites-context"
import { CurrencyProvider } from "@/lib/currency-context"
import { TranslationProvider } from "@/lib/i18n/translation-provider"
import { Header } from "@/components/header"
import { ScrollToTop } from "@/components/scroll-to-top"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import WhatsAppFloatingButton from "@/components/whatsapp-floating-button"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isPanelRoute = pathname?.startsWith("/panel")
  const isAuthRoute =
    pathname?.startsWith("/(auth)") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password"
  
  // Detectar si es página 404 o no encontrada
  const isNotFoundPage = 
    pathname?.includes("404") || 
    pathname?.includes("not-found") ||
    pathname === "/404" ||
    // Verificar si children es el componente NotFound
    (children as any)?.type?.name === "NotFound" ||
    (children as any)?.props?.children?.type?.name === "NotFound"

  return (
    <TranslationProvider>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <FavoritesProvider>
              <CurrencyProvider>
                <ScrollToTop />
                {!isPanelRoute && !isAuthRoute && !isNotFoundPage && <Header />}
                {children}
                {!isPanelRoute && !isAuthRoute && !isNotFoundPage && <Footer />}
                {!isPanelRoute && !isAuthRoute && !isNotFoundPage && <WhatsAppFloatingButton />}
                <Toaster />
              </CurrencyProvider>
            </FavoritesProvider>
          </CartProvider>
        </AdminProvider>
        <Analytics />
      </AuthProvider>
    </TranslationProvider>
  )
}
