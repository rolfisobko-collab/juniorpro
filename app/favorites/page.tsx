"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useFavorites } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { Heart } from "lucide-react"

export default function FavoritesPage() {
  const { user } = useAuth()
  const { favorites } = useFavorites()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [router, user])

  if (!user) return null

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Mis Favoritos</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? "producto" : "productos"} guardados
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16 max-w-2xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h2 className="font-serif text-2xl font-bold mb-3">Aún no tienes favoritos</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Explora nuestros productos y guarda tus favoritos haciendo clic en el corazón
              </p>
              <Link href="/products">
                <Button size="lg" className="h-12 px-8">
                  Explorar Productos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 max-[325px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
