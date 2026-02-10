"use client"

import { useState } from "react"
import { Link } from "lucide-react"

interface QuickImageInputProps {
  product: {
    id: string
    name: string
    image: string
  }
  onImageUpdate: (productId: string, imageUrl: string) => void
}

export function QuickImageInput({ product, onImageUpdate }: QuickImageInputProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (imageUrl.trim()) {
      onImageUpdate(product.id, imageUrl.trim())
      setImageUrl("")
      setIsVisible(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false)
      setImageUrl("")
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsVisible(true)
        }}
        className="bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-110"
        title="Pegar URL rápido"
      >
        <Link className="w-3 h-3" />
      </button>
    )
  }

  return (
    <div 
      className="absolute top-3 right-3 z-30 bg-white rounded-lg shadow-2xl border p-3 w-80"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            URL para {product.name.substring(0, 20)}...
          </label>
          <button
            type="button"
            onClick={() => {
              setIsVisible(false)
              setImageUrl("")
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Pega la URL aquí..."
            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!imageUrl.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Listo
          </button>
        </div>
        
        <div className="text-xs text-gray-500">
          Enter para guardar • Esc para cancelar
        </div>
      </form>
    </div>
  )
}
