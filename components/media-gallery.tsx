"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, Image as ImageIcon, Video, Plus } from "lucide-react"
import { ImageUpload } from "./image-upload"

interface MediaGalleryProps {
  images: string[]
  videos: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
  className?: string
}

export function MediaGallery({ 
  images, 
  videos, 
  onImagesChange, 
  onVideosChange, 
  className 
}: MediaGalleryProps) {
  const [newVideoUrl, setNewVideoUrl] = useState("")

  const handleImageUpload = (url: string) => {
    onImagesChange([...images, url])
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const addVideo = () => {
    if (newVideoUrl.trim()) {
      onVideosChange([...videos, newVideoUrl.trim()])
      setNewVideoUrl("")
    }
  }

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Imágenes ({images.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Subir Imágenes</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Agrega múltiples imágenes para tu producto. La primera será la principal.
              </p>
              <ImageUpload
                value=""
                onChange={handleImageUpload}
              />
            </div>

            {images.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Imágenes Agregadas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={`${image}?t=${Date.now()}`}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Agregar Videos</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Agrega videos de YouTube, Vimeo o cualquier otro servicio.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVideo()}
                />
                <Button onClick={addVideo} disabled={!newVideoUrl.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {videos.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Videos Agregados</Label>
                <div className="space-y-3">
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{video}</p>
                        <p className="text-xs text-muted-foreground">
                          {getVideoPlatform(video)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVideo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getVideoPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube'
  } else if (url.includes('vimeo.com')) {
    return 'Vimeo'
  } else if (url.includes('dailymotion.com')) {
    return 'Dailymotion'
  } else {
    return 'Otro'
  }
}
