"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "./products-data"

interface FavoritesContextType {
  favorites: Product[]
  addFavorite: (product: Product) => void
  removeFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: Product) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })

        if (res.ok) {
          const data = (await res.json()) as { favorites?: Product[] }
          if (!cancelled) setFavorites(data.favorites ?? [])
          return
        }
      } catch {
        // ignore
      }

      const storedFavorites = localStorage.getItem("favorites")
      if (storedFavorites && !cancelled) {
        setFavorites(JSON.parse(storedFavorites))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (product: Product) => {
    void fetch(`/api/favorites/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    setFavorites((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current
      }
      return [...current, product]
    })
  }

  const removeFavorite = (productId: string) => {
    void fetch(`/api/favorites/${productId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    setFavorites((current) => current.filter((item) => item.id !== productId))
  }

  const isFavorite = (productId: string) => {
    return favorites.some((item) => item.id === productId)
  }

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id)
    } else {
      addFavorite(product)
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
