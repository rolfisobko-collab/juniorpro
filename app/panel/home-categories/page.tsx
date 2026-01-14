"use client"

import { useEffect, useState, Suspense } from "react"
import PanelLayout from "@/components/panel-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, MoveUp, MoveDown, Eye, EyeOff, ImageIcon } from "lucide-react"
import Image from "next/image"

interface HomeCategory {
  id: string
  name: string
  image: string
  link: string
  order: number
  active: boolean
}

function HomeCategoriesContent() {
  const [categories, setCategories] = useState<HomeCategory[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<HomeCategory | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    link: "",
    active: true,
  })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/admin/home-categories", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) return

      const data = (await res.json()) as { categories?: HomeCategory[] }
      if (!cancelled) setCategories((data.categories ?? []).sort((a, b) => a.order - b.order))
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: "", image: "", link: "", active: true })
    setIsDialogOpen(true)
  }

  const handleEdit = (category: HomeCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      image: category.image,
      link: category.link,
      active: category.active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingCategory) {
      void fetch(`/api/admin/home-categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData }),
      })

      setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...c, ...formData } : c)))
    } else {
      const newOrder = Math.max(...categories.map((c) => c.order), 0) + 1
      void (async () => {
        const res = await fetch("/api/admin/home-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...formData, order: newOrder }),
        })

        if (!res.ok) return

        const data = (await res.json()) as { category?: HomeCategory }
        setCategories((current) =>
          data.category ? [...current, data.category].sort((a, b) => a.order - b.order) : current
        )
      })()
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      void fetch(`/api/admin/home-categories/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      setCategories(categories.filter((c) => c.id !== id))
    }
  }

  const handleToggleActive = (category: HomeCategory) => {
    void fetch(`/api/admin/home-categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ active: !category.active }),
    })

    setCategories(categories.map((c) => (c.id === category.id ? { ...c, active: !c.active } : c)).sort((a, b) => a.order - b.order))
  }

  const handleMoveUp = (category: HomeCategory) => {
    const index = categories.findIndex((c) => c.id === category.id)
    if (index > 0) {
      const prevCategory = categories[index - 1]
      void fetch(`/api/admin/home-categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order: prevCategory.order }),
      })
      void fetch(`/api/admin/home-categories/${prevCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order: category.order }),
      })
      setCategories(categories.map((c) => (c.id === category.id ? { ...c, order: prevCategory.order } : c.id === prevCategory.id ? { ...c, order: category.order } : c)).sort((a, b) => a.order - b.order))
    }
  }

  const handleMoveDown = (category: HomeCategory) => {
    const index = categories.findIndex((c) => c.id === category.id)
    if (index < categories.length - 1) {
      const nextCategory = categories[index + 1]
      void fetch(`/api/admin/home-categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order: nextCategory.order }),
      })
      void fetch(`/api/admin/home-categories/${nextCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order: category.order }),
      })
      setCategories(categories.map((c) => (c.id === category.id ? { ...c, order: nextCategory.order } : c.id === nextCategory.id ? { ...c, order: category.order } : c)).sort((a, b) => a.order - b.order))
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categorías del Home</h1>
          <p className="text-muted-foreground mt-1">Gestiona las categorías que se muestran en la página principal</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Orden</th>
                <th className="text-left p-4 font-semibold">Imagen</th>
                <th className="text-left p-4 font-semibold">Nombre</th>
                <th className="text-left p-4 font-semibold">Enlace</th>
                <th className="text-left p-4 font-semibold">Estado</th>
                <th className="text-right p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} className="border-b hover:bg-muted/20">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{category.order}</span>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoveUp(category)}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoveDown(category)}
                          disabled={index === categories.length - 1}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{category.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{category.link}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(category)}
                        title={category.active ? "Desactivar" : "Activar"}
                      >
                        {category.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Actualiza la información de la categoría"
                : "Crea una nueva categoría para mostrar en el home"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Categoría</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Smartphones"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL de la Imagen</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/ruta/a/imagen.jpg"
              />
              <p className="text-xs text-muted-foreground">
                <ImageIcon className="inline h-3 w-3 mr-1" />
                Recomendado: 800x600px - Formatos: JPG, PNG, WebP
              </p>
              {formData.image && (
                <div className="relative h-40 w-full rounded-lg overflow-hidden bg-muted mt-2">
                  <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Enlace</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/products?category=Electrónica"
              />
              <p className="text-xs text-muted-foreground">URL a la que redirigirá la categoría</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Categoría activa (visible en el home)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{editingCategory ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function HomeCategoriesPage() {
  return (
    <PanelLayout>
      <Suspense fallback={<div className="p-6">Cargando...</div>}>
        <HomeCategoriesContent />
      </Suspense>
    </PanelLayout>
  )
}
