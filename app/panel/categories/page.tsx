"use client"

import type React from "react"
import PanelLayout from "@/components/panel-layout"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  subcategories: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  slug: string
}

export default function AdminCategoriesPage() {
  const { toast } = useToast()
  const [categories, setLocalCategories] = useState<Category[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/admin/categories", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) return

      const data = (await res.json()) as { categories?: any[] }
      const mapped = (data.categories ?? []).map((c) => ({
        id: c.key,
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
        subcategories: (c.subcategories ?? []).map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
        })),
      })) as Category[]

      if (!cancelled) setLocalCategories(mapped)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const updateCategories = (newCategories: Category[]) => {
    setLocalCategories(newCategories)
  }

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<string>("")
  const [editingSubcategory, setEditingSubcategory] = useState<{ categoryId: string; subcategory: Subcategory } | null>(
    null,
  )

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
  })

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    slug: "",
  })

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCategory) {
      void fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: categoryForm.name,
          slug: categoryForm.slug,
          description: categoryForm.description,
        }),
      })

      updateCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: categoryForm.name, slug: categoryForm.slug, description: categoryForm.description }
            : c,
        ),
      )
      toast({ title: "Categoría actualizada", description: "Los cambios se han guardado correctamente" })
    } else {
      void (async () => {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: categoryForm.name,
            slug: categoryForm.slug,
            description: categoryForm.description,
          }),
        })

        if (!res.ok) return

        const data = (await res.json()) as { category?: any }
        const c = data.category
        if (!c) return

        const mapped: Category = {
          id: c.key,
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          subcategories: [],
        }
        updateCategories([...categories, mapped])
      })()

      toast({ title: "Categoría creada", description: "La nueva categoría se ha agregado" })
    }

    setIsCategoryDialogOpen(false)
    resetCategoryForm()
  }

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSubcategory) {
      void fetch(`/api/admin/subcategories/${editingSubcategory.subcategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: subcategoryForm.name, slug: subcategoryForm.slug }),
      })

      updateCategories(
        categories.map((c) =>
          c.id === editingSubcategory.categoryId
            ? {
                ...c,
                subcategories: c.subcategories.map((s) =>
                  s.id === editingSubcategory.subcategory.id
                    ? { ...s, name: subcategoryForm.name, slug: subcategoryForm.slug }
                    : s,
                ),
              }
            : c,
        ),
      )
      toast({ title: "Subcategoría actualizada", description: "Los cambios se han guardado" })
    } else {
      void (async () => {
        const res = await fetch(`/api/admin/categories/${selectedCategoryForSub}/subcategories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: subcategoryForm.name, slug: subcategoryForm.slug }),
        })

        if (!res.ok) return

        const data = (await res.json()) as { subcategory?: any }
        const s = data.subcategory
        if (!s) return

        updateCategories(
          categories.map((c) =>
            c.id === selectedCategoryForSub
              ? {
                  ...c,
                  subcategories: [...c.subcategories, { id: s.id, name: s.name, slug: s.slug }],
                }
              : c,
          ),
        )
      })()

      toast({ title: "Subcategoría creada", description: "La nueva subcategoría se ha agregado" })
    }

    setIsSubcategoryDialogOpen(false)
    resetSubcategoryForm()
  }

  const handleDeleteCategory = (id: string) => {
    void fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    updateCategories(categories.filter((c) => c.id !== id))
    toast({ title: "Categoría eliminada", description: "La categoría se ha eliminado" })
  }

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    void fetch(`/api/admin/subcategories/${subcategoryId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    const updated = categories.map((c) =>
      c.id === categoryId ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subcategoryId) } : c,
    )
    updateCategories(updated)
    toast({ title: "Subcategoría eliminada", description: "La subcategoría se ha eliminado" })
  }

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", slug: "", description: "" })
    setEditingCategory(null)
  }

  const resetSubcategoryForm = () => {
    setSubcategoryForm({ name: "", slug: "" })
    setEditingSubcategory(null)
    setSelectedCategoryForSub("")
  }

  return (
    <PanelLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Categorías y Subcategorías</h1>
            <p className="text-muted-foreground">Organiza el catálogo de productos</p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isSubcategoryDialogOpen}
              onOpenChange={(open) => {
                setIsSubcategoryDialogOpen(open)
                if (!open) resetSubcategoryForm()
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Subcategoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSubcategory ? "Editar Subcategoría" : "Nueva Subcategoría"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubcategorySubmit}>
                  <div className="grid gap-4 py-4">
                    {!editingSubcategory && (
                      <div className="grid gap-2">
                        <Label htmlFor="parent-category">Categoría Padre</Label>
                        <Select value={selectedCategoryForSub} onValueChange={setSelectedCategoryForSub} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="sub-name">Nombre</Label>
                      <Input
                        id="sub-name"
                        value={subcategoryForm.name}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-slug">Slug</Label>
                      <Input
                        id="sub-slug"
                        value={subcategoryForm.slug}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingSubcategory ? "Actualizar" : "Crear"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={(open) => {
                setIsCategoryDialogOpen(open)
                if (!open) resetCategoryForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cat-name">Nombre</Label>
                      <Input
                        id="cat-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cat-slug">Slug</Label>
                      <Input
                        id="cat-slug"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cat-desc">Descripción</Label>
                      <Input
                        id="cat-desc"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingCategory ? "Actualizar" : "Crear"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderTree className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <Badge variant="secondary">{category.subcategories.length} subcategorías</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Slug: {category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(category)
                      setCategoryForm({
                        name: category.name,
                        slug: category.slug,
                        description: category.description,
                      })
                      setIsCategoryDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {category.subcategories.length > 0 && (
                <div className="mt-4 pl-8">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Subcategorías:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {category.subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-muted/50 rounded-md p-3">
                        <div>
                          <p className="font-medium text-sm">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.slug}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSubcategory({ categoryId: category.id, subcategory: sub })
                              setSubcategoryForm({ name: sub.name, slug: sub.slug })
                              setIsSubcategoryDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubcategory(category.id, sub.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PanelLayout>
  )
}
