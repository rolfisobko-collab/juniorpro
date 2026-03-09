"use client"

import { useEffect, useState } from "react"
import PanelLayout from "@/components/panel-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Brand {
  id: string
  name: string
  slug: string
  image: string | null
  active: boolean
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", image: "", active: true })
  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/admin/brands", { credentials: "include" })
      .then(r => r.json())
      .then(d => setBrands(d.brands ?? []))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", image: "", active: true })
    setDialogOpen(true)
  }

  const openEdit = (b: Brand) => {
    setEditing(b)
    setForm({ name: b.name, image: b.image ?? "", active: b.active })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast({ title: "El nombre es requerido", variant: "destructive" })
    setSaving(true)
    try {
      if (editing) {
        const res = await fetch(`/api/admin/brands/${editing.id}`, {
          method: "PUT", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setBrands(prev => prev.map(b => b.id === editing.id ? data.brand : b))
        toast({ title: "Marca actualizada" })
      } else {
        const res = await fetch("/api/admin/brands", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setBrands(prev => [...prev, data.brand].sort((a, b) => a.name.localeCompare(b.name)))
        toast({ title: "Marca creada" })
      }
      setDialogOpen(false)
    } catch (e: any) {
      toast({ title: e.message ?? "Error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (b: Brand) => {
    if (!confirm(`¿Eliminar "${b.name}"?`)) return
    await fetch(`/api/admin/brands/${b.id}`, { method: "DELETE", credentials: "include" })
    setBrands(prev => prev.filter(x => x.id !== b.id))
    toast({ title: "Marca eliminada" })
  }

  const handleToggle = async (b: Brand) => {
    const res = await fetch(`/api/admin/brands/${b.id}`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    })
    const data = await res.json()
    setBrands(prev => prev.map(x => x.id === b.id ? data.brand : x))
  }

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <PanelLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Marcas</h1>
            <p className="text-sm text-muted-foreground">Gestioná las marcas y sus imágenes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/panel/images/brands">
                <ImageIcon className="h-4 w-4 mr-2" /> Buscar imágenes
              </a>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Nueva marca
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar marca..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-sm flex-wrap">
          <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">Total: {brands.length}</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Activas: {brands.filter(b => b.active).length}</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Sin imagen: {brands.filter(b => !b.image).length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold">Marca</th>
                  <th className="text-left p-4 text-sm font-semibold hidden sm:table-cell">Slug</th>
                  <th className="text-left p-4 text-sm font-semibold">Estado</th>
                  <th className="text-right p-4 text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-muted-foreground">
                      {search ? "No se encontraron marcas con ese nombre" : "No hay marcas. Creá una para empezar."}
                    </td>
                  </tr>
                ) : filtered.map(b => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                          {b.image ? (
                            <img src={b.image} alt={b.name} className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <span className="font-medium">{b.name}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground font-mono">{b.slug}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={b.active ? "default" : "secondary"}>
                        {b.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(b)} title={b.active ? "Desactivar" : "Activar"}>
                          {b.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(b)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar marca" : "Nueva marca"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Apple, Samsung, Sony..."
              />
            </div>
            <div className="space-y-2">
              <Label>URL de imagen (logo)</Label>
              <Input
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
              {form.image && (
                <div className="h-24 w-full rounded-xl border bg-white flex items-center justify-center overflow-hidden mt-2">
                  <img src={form.image} alt="preview" className="h-full object-contain p-2" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="active" className="cursor-pointer">Activa (visible en la tienda)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? "Guardar cambios" : "Crear marca"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  )
}
