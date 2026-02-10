"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UnifiedProduct } from "./product-types"
import type { Currency } from "./currency-context"

interface CartItem {
  product: UnifiedProduct
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: UnifiedProduct, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  totalInUSD: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    // Cargar desde localStorage inmediatamente (prioridad absoluta)
    const loadCartFromStorage = () => {
      try {
        const storedCart = localStorage.getItem("cart")
        console.log('🛒 Loading cart from localStorage...')
        
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart)
          // Filtrar items inválidos que no tengan product completo
          const validItems = parsedCart.filter((item: CartItem) => 
            item && item.product && item.product.id && item.product.price
          )
          setItems(validItems)
          console.log('🛒 Cart loaded from localStorage:', validItems.length, 'items')
        } else {
          console.log('🛒 No cart found in localStorage')
          setItems([])
        }
      } catch (error) {
        console.error('🛒 Error loading cart from localStorage:', error)
        setItems([])
      }
    }

    // Ejecutar inmediatamente
    loadCartFromStorage()

    // Luego intentar sincronizar con el servidor (opcional, en background)
    const syncWithServer = async () => {
      // Pequeño delay para asegurar que el auth context esté cargado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        const res = await fetch("/api/cart", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })

        if (res.ok) {
          const data = (await res.json()) as { items?: CartItem[] }
          // Solo usar datos del servidor si localStorage está vacío
          const storedCart = localStorage.getItem("cart")
          if (!storedCart && data.items) {
            const validItems = data.items.filter(item => 
              item && item.product && item.product.id && item.product.price
            )
            setItems(validItems)
            localStorage.setItem("cart", JSON.stringify(validItems))
            console.log('🛒 Cart loaded from server and saved to localStorage:', validItems.length, 'items')
          }
        }
      } catch (error) {
        console.log('🛒 Server sync failed, using localStorage only:', error)
        // ignore, ya tenemos datos de localStorage
      }
    }

    syncWithServer()
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addItem = (product: UnifiedProduct, quantity = 1) => {
    void fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId: product.id, quantity }),
    })

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }

      return [...currentItems, { product, quantity }]
    })
  }

  const removeItem = (productId: string) => {
    void fetch(`/api/cart/items/${productId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    void fetch(`/api/cart/items/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    })

    setItems((currentItems) => currentItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    for (const item of items) {
      void fetch(`/api/cart/items/${item.product.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
    }
    setItems([])
  }

  const total = items.reduce((sum, item) => {
    if (!item.product || !item.product.price) return sum
    return sum + item.product.price * item.quantity
  }, 0)
  const totalInUSD = total // Keep USD total for backend calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, totalInUSD, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
