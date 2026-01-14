"use client"

import type React from "react"
import PanelLayout from "@/components/panel-layout"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Eye, EyeOff, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface CTA {
  id: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
  imageDesktop: string
  imageMobile: string
  desktopWidth: number
  desktopHeight: number
  mobileWidth: number
  mobileHeight: number
  position: number
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export default function AdminCTAsPage() {
  const { toast } = useToast()
  const [ctas, setCTAs] = useState<CTA[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCTA, setEditingCTA] = useState<CTA | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/admin/ctas", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) return
      const data = (await res.json()) as { ctas?: CTA[] }
      if (!cancelled) setCTAs(data.ctas ?? [])
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const [formData, setFormData] = useState<Omit<CTA, "id">>({
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    imageDesktop: "",
    imageMobile: "",
    desktopWidth: 1200,
    desktopHeight: 600,
    mobileWidth: 600,
    mobileHeight: 800,
    position: ctas.length + 1,
    isActive: true,
    backgroundColor: "#1e40af",
    textColor: "#ffffff",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCTA) {
      void fetch(`/api/admin/ctas/${editingCTA.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData }),
      })

      setCTAs(ctas.map((c) => (c.id === editingCTA.id ? { ...formData, id: editingCTA.id } : c)))
      toast({ title: "CTA actualizado", description: "Los cambios se han guardado correctamente" })
    } else {
      void (async () => {
        const res = await fetch("/api/admin/ctas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...formData }),
        })

        if (!res.ok) return
        const data = (await res.json()) as { cta?: CTA }
        setCTAs((current) => (data.cta ? [...current, data.cta] : current))
      })()

      toast({ title: "CTA creado", description: "El nuevo CTA se ha agregado" })
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (cta: CTA) => {
    setEditingCTA(cta)
    setFormData({
      title: cta.title,
      description: cta.description,
      buttonText: cta.buttonText,
      buttonLink: cta.buttonLink,
      imageDesktop: cta.imageDesktop,
      imageMobile: cta.imageMobile,
      desktopWidth: cta.desktopWidth,
      desktopHeight: cta.desktopHeight,
      mobileWidth: cta.mobileWidth,
      mobileHeight: cta.mobileHeight,
      position: cta.position,
      isActive: cta.isActive,
      backgroundColor: cta.backgroundColor,
      textColor: cta.textColor,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    void fetch(`/api/admin/ctas/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    setCTAs(ctas.filter((c) => c.id !== id))
    toast({ title: "CTA eliminado", description: "El CTA se ha eliminado" })
  }

  const toggleActive = (id: string) => {
    const target = ctas.find((c) => c.id === id)
    if (!target) return

    void fetch(`/api/admin/ctas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !target.isActive }),
    })

    setCTAs(ctas.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      imageDesktop: "",
      imageMobile: "",
      desktopWidth: 1200,
      desktopHeight: 600,
      mobileWidth: 600,
      mobileHeight: 800,
      position: ctas.length + 1,
      isActive: true,
      backgroundColor: "#1e40af",
      textColor: "#ffffff",
    })
    setEditingCTA(null)
  }

  return (
    <PanelLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Call-to-Actions (CTAs)</h1>
            <p className="text-muted-foreground">Gestiona los banners y llamadas a la acción del home</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo CTA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCTA ? "Editar CTA" : "Nuevo CTA"}</DialogTitle>
                <DialogDescription>
                  {editingCTA ? "Actualiza la información del CTA" : "Crea un nuevo banner o CTA para el home"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="buttonText">Texto del Botón</Label>
                      <Input
                        id="buttonText"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="buttonLink">Enlace del Botón</Label>
                      <Input
                        id="buttonLink"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imágenes
                    </h4>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="imageDesktop">URL Imagen Desktop</Label>
                        <Input
                          id="imageDesktop"
                          type="url"
                          value={formData.imageDesktop}
                          onChange={(e) => setFormData({ ...formData, imageDesktop: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="desktopWidth">Ancho Desktop (px)</Label>
                          <Input
                            id="desktopWidth"
                            type="number"
                            value={formData.desktopWidth}
                            onChange={(e) =>
                              setFormData({ ...formData, desktopWidth: Number.parseInt(e.target.value) })
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="desktopHeight">Alto Desktop (px)</Label>
                          <Input
                            id="desktopHeight"
                            type="number"
                            value={formData.desktopHeight}
                            onChange={(e) =>
                              setFormData({ ...formData, desktopHeight: Number.parseInt(e.target.value) })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="imageMobile">URL Imagen Mobile</Label>
                        <Input
                          id="imageMobile"
                          type="url"
                          value={formData.imageMobile}
                          onChange={(e) => setFormData({ ...formData, imageMobile: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="mobileWidth">Ancho Mobile (px)</Label>
                          <Input
                            id="mobileWidth"
                            type="number"
                            value={formData.mobileWidth}
                            onChange={(e) => setFormData({ ...formData, mobileWidth: Number.parseInt(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="mobileHeight">Alto Mobile (px)</Label>
                          <Input
                            id="mobileHeight"
                            type="number"
                            value={formData.mobileHeight}
                            onChange={(e) =>
                              setFormData({ ...formData, mobileHeight: Number.parseInt(e.target.value) })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4">Estilo</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="backgroundColor">Color de Fondo</Label>
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="textColor">Color de Texto</Label>
                        <Input
                          id="textColor"
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Activo</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingCTA ? "Actualizar" : "Crear"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Especificaciones de Imágenes Recomendadas</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">Desktop:</p>
              <p>Ancho: 1200px - 1920px</p>
              <p>Alto: 400px - 600px</p>
              <p>Ratio recomendado: 16:9 o 2:1</p>
            </div>
            <div>
              <p className="font-medium mb-1">Mobile:</p>
              <p>Ancho: 600px - 800px</p>
              <p>Alto: 800px - 1000px</p>
              <p>Ratio recomendado: 3:4 o 9:16</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {ctas
            .sort((a, b) => a.position - b.position)
            .map((cta) => (
              <Card key={cta.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{cta.title}</CardTitle>
                        {cta.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Activo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                        )}
                      </div>
                      <CardDescription>{cta.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(cta.id)}>
                        {cta.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(cta)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cta.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Desktop</p>
                      <div className="border rounded-lg p-2 bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">
                          {cta.desktopWidth}px × {cta.desktopHeight}px
                        </p>
                        <div className="aspect-video bg-background rounded overflow-hidden">
                          <img
                            src={cta.imageDesktop || "/placeholder.svg"}
                            alt={cta.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Mobile</p>
                      <div className="border rounded-lg p-2 bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">
                          {cta.mobileWidth}px × {cta.mobileHeight}px
                        </p>
                        <div className="aspect-[3/4] bg-background rounded overflow-hidden max-w-[200px]">
                          <img
                            src={cta.imageMobile || "/placeholder.svg"}
                            alt={cta.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Botón:</span>
                      <span className="font-medium">{cta.buttonText}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Link:</span>
                      <span className="font-mono text-xs">{cta.buttonLink}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Colores:</span>
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: cta.backgroundColor || "#1e40af" }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: cta.textColor || "#ffffff" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </PanelLayout>
  )
}
