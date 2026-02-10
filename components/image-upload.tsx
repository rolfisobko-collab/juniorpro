"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar preview con value externo
  useEffect(() => {
    setPreview(value || "")
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload error:', errorData)
        throw new Error(errorData.error || 'Error al subir la imagen')
      }

      const data = await response.json()
      const imageUrl = data.url

      setPreview(imageUrl)
      onChange(imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(`Error al subir la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (url: string) => {
    setPreview(url)
    // No llamar onChange aquí, solo actualizar el preview
  }

  const handleSave = () => {
    if (preview) {
      onChange(preview)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-2">
        <Label>Subir Imagen</Label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-md border"
          />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="image-url">O pegar URL de imagen</Label>
        <Input
          id="image-url"
          type="url"
          placeholder="https://ejemplo.com/imagen.jpg"
          value={preview}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        {preview && (
          <Button 
            onClick={handleSave}
            className="w-full"
            type="button"
          >
            Guardar Imagen
          </Button>
        )}
      </div>

      {!preview && (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Selecciona una imagen o pega una URL
          </p>
        </div>
      )}
    </div>
  )
}
