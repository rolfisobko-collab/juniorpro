"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Image as ImageIcon } from "lucide-react"

interface ImageLinkModalProps {
  productId: string
  currentImage: string
  onImageUpdate: (productId: string, newImageUrl: string) => void
  children?: React.ReactNode
}

export function ImageLinkModal({ productId, currentImage, onImageUpdate, children }: ImageLinkModalProps) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImage)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!imageUrl.trim()) {
      return
    }

    setIsLoading(true)
    try {
      // Llamar a la función de actualización
      await onImageUpdate(productId, imageUrl.trim())
      setOpen(false)
    } catch (error) {
      console.error('Error updating image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setImageUrl(currentImage) // Resetear al valor original
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <ImageIcon className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Imagen del Producto</DialogTitle>
          <DialogDescription>
            Ingresa la URL de la nueva imagen para este producto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">URL de la Imagen</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full"
            />
          </div>
          
          {imageUrl && (
            <div className="grid gap-2">
              <Label>Previsualización</Label>
              <div className="border rounded-lg p-2 bg-muted/10">
                <img
                  src={imageUrl}
                  alt="Previsualización"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png'
                  }}
                />
              </div>
            </div>
          )}

          {currentImage && (
            <div className="grid gap-2">
              <Label>Imagen Actual</Label>
              <div className="border rounded-lg p-2 bg-muted/10">
                <img
                  src={currentImage}
                  alt="Imagen actual"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png'
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!imageUrl.trim() || isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
