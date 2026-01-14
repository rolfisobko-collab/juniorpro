"use client"

import { Suspense, useEffect, useState } from "react"
import PanelLayout from "@/components/panel-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, EyeOff, MoveUp, MoveDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CarouselSlide {
  id: number
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  image: string
  imageMobile: string
  backgroundColor: string
  textColor: string
  position: number
  isActive: boolean
}

function CarouselManagementContent() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/admin/carousel", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) return

      const data = (await res.json()) as { slides?: CarouselSlide[] }
      if (!cancelled) setSlides(data.slides ?? [])
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    image: "",
    imageMobile: "",
    backgroundColor: "#000000",
    textColor: "#ffffff",
  })

  const handleCreate = () => {
    setEditingSlide(null)
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      image: "",
      imageMobile: "",
      backgroundColor: "#000000",
      textColor: "#ffffff",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      image: slide.image,
      imageMobile: slide.imageMobile,
      backgroundColor: slide.backgroundColor,
      textColor: slide.textColor,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingSlide) {
      void fetch(`/api/admin/carousel/${editingSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData }),
      })

      setSlides(slides.map((s) => (s.id === editingSlide.id ? { ...s, ...formData } : s)))
      toast({ title: "Slide actualizado", description: "El slide se ha actualizado correctamente" })
    } else {
      void (async () => {
        const res = await fetch("/api/admin/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...formData, isActive: true }),
        })

        if (!res.ok) return
        const data = (await res.json()) as { slide?: CarouselSlide }
        setSlides((current) => (data.slide ? [...current, data.slide] : current))
      })()

      toast({ title: "Slide creado", description: "El nuevo slide se ha creado correctamente" })
    }

    setIsDialogOpen(false)
  }

  const handleDelete = (id: number) => {
    void fetch(`/api/admin/carousel/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    setSlides(slides.filter((s) => s.id !== id))
    toast({
      title: "Slide eliminado",
      description: "El slide se ha eliminado correctamente",
    })
  }

  const handleToggleActive = (id: number) => {
    const target = slides.find((s) => s.id === id)
    if (!target) return

    void fetch(`/api/admin/carousel/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !target.isActive }),
    })

    setSlides(slides.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)))
  }

  const handleMoveUp = (id: number) => {
    const index = slides.findIndex((s) => s.id === id)
    if (index > 0) {
      const newSlides = [...slides]
      ;[newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]]
      newSlides.forEach((s, i) => {
        s.position = i + 1
      })

      for (const s of newSlides) {
        void fetch(`/api/admin/carousel/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ position: s.position }),
        })
      }

      setSlides(newSlides)
    }
  }

  const handleMoveDown = (id: number) => {
    const index = slides.findIndex((s) => s.id === id)
    if (index < slides.length - 1) {
      const newSlides = [...slides]
      ;[newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]]
      newSlides.forEach((s, i) => {
        s.position = i + 1
      })

      for (const s of newSlides) {
        void fetch(`/api/admin/carousel/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ position: s.position }),
        })
      }

      setSlides(newSlides)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Carrusel</h1>
          <p className="text-muted-foreground">Administra los slides del carrusel principal</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Slide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slides del Carrusel</CardTitle>
          <CardDescription>Dimensiones recomendadas: Desktop: 1920x600px | Mobile: 800x600px</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead>Vista Previa</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides
                .sort((a, b) => a.position - b.position)
                .map((slide, index) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{slide.position}</span>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveUp(slide.id)}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveDown(slide.id)}
                            disabled={index === slides.length - 1}
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <img
                        src={slide.image || "/placeholder.svg"}
                        alt={slide.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{slide.title}</p>
                        <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={slide.isActive ? "default" : "secondary"}>
                        {slide.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(slide.id)}>
                          {slide.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Editar Slide" : "Nuevo Slide"}</DialogTitle>
            <DialogDescription>Completa los detalles del slide del carrusel</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buttonText">Texto del Botón</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="buttonLink">Enlace del Botón</Label>
                <Input
                  id="buttonLink"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Imagen Desktop (1920x600px recomendado)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/ruta/imagen-desktop.jpg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageMobile">Imagen Mobile (800x600px recomendado)</Label>
              <Input
                id="imageMobile"
                value={formData.imageMobile}
                onChange={(e) => setFormData({ ...formData, imageMobile: e.target.value })}
                placeholder="/ruta/imagen-mobile.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="backgroundColor">Color de Fondo</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="textColor">Color de Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CarouselManagementPage() {
  return (
    <PanelLayout>
      <Suspense fallback={<div className="p-6">Cargando...</div>}>
        <CarouselManagementContent />
      </Suspense>
    </PanelLayout>
  )
}
