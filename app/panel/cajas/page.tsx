"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Package, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react"
import { useAdmin } from "@/lib/admin-context"
import PanelLayout from "@/components/panel-layout"

interface BoxStandard {
  id: string
  name: string
  lengthCm: number
  widthCm: number
  heightCm: number
  paddingCm: number
  maxWeightKg: number
  boxWeightKg: number
  isActive: boolean
  sortOrder: number
}

const emptyForm = {
  name: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  paddingCm: "3",
  maxWeightKg: "",
  boxWeightKg: "0.3",
  isActive: true,
  sortOrder: "0",
}

export default function CajasPage() {
  const { admin } = useAdmin()
  const [boxes, setBoxes] = useState<BoxStandard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const headers = { "Content-Type": "application/json", "x-admin-id": admin?.id || "" }

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/boxes", { headers })
      const data = await res.json()
      setBoxes(data)
    } catch {
      setError("Error al cargar cajas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setShowForm(true)
  }

  const openEdit = (box: BoxStandard) => {
    setEditingId(box.id)
    setForm({
      name: box.name,
      lengthCm: String(box.lengthCm),
      widthCm: String(box.widthCm),
      heightCm: String(box.heightCm),
      paddingCm: String(box.paddingCm),
      maxWeightKg: String(box.maxWeightKg),
      boxWeightKg: String(box.boxWeightKg),
      isActive: box.isActive,
      sortOrder: String(box.sortOrder),
    })
    setError("")
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.lengthCm || !form.widthCm || !form.heightCm || !form.maxWeightKg) {
      setError("Completá todos los campos requeridos")
      return
    }
    setSaving(true)
    setError("")
    try {
      const url = editingId ? `/api/admin/boxes/${editingId}` : "/api/admin/boxes"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) })
      if (!res.ok) throw new Error("Error al guardar")
      await load()
      setShowForm(false)
    } catch {
      setError("Error al guardar la caja")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/admin/boxes/${id}`, { method: "DELETE", headers })
      await load()
    } catch {
      setError("Error al eliminar")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (box: BoxStandard) => {
    await fetch(`/api/admin/boxes/${box.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ isActive: !box.isActive }),
    })
    await load()
  }

  // Volumen útil interior
  const innerVolume = (box: BoxStandard) => {
    const l = box.lengthCm - box.paddingCm * 2
    const w = box.widthCm - box.paddingCm * 2
    const h = box.heightCm - box.paddingCm * 2
    return Math.max(0, l * w * h)
  }

  return (
    <PanelLayout>
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-7 w-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cajas de Envío</h1>
            <p className="text-sm text-gray-500">Gestioná los estándares de caja para AEX</p>
          </div>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Nueva caja
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <Card className="mb-6 border-2 border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{editingId ? "Editar caja" : "Nueva caja"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-2 md:col-span-4 space-y-1">
                <Label className="text-xs font-semibold">Nombre <span className="text-red-500">*</span></Label>
                <Input placeholder="Ej: Caja M" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Largo exterior (cm) <span className="text-red-500">*</span></Label>
                <Input type="number" placeholder="40" value={form.lengthCm} onChange={e => setForm(f => ({ ...f, lengthCm: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Ancho exterior (cm) <span className="text-red-500">*</span></Label>
                <Input type="number" placeholder="30" value={form.widthCm} onChange={e => setForm(f => ({ ...f, widthCm: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Alto exterior (cm) <span className="text-red-500">*</span></Label>
                <Input type="number" placeholder="20" value={form.heightCm} onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Relleno por lado (cm)</Label>
                <Input type="number" placeholder="3" value={form.paddingCm} onChange={e => setForm(f => ({ ...f, paddingCm: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Peso máx. contenido (kg) <span className="text-red-500">*</span></Label>
                <Input type="number" step="0.1" placeholder="8" value={form.maxWeightKg} onChange={e => setForm(f => ({ ...f, maxWeightKg: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Peso caja vacía (kg)</Label>
                <Input type="number" step="0.1" placeholder="0.3" value={form.boxWeightKg} onChange={e => setForm(f => ({ ...f, boxWeightKg: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Orden</Label>
                <Input type="number" placeholder="0" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1 flex flex-col justify-end">
                <Label className="text-xs font-semibold">Activa</Label>
                <div className="h-10 flex items-center">
                  <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
                </div>
              </div>
            </div>

            {/* Preview volumen útil */}
            {form.lengthCm && form.widthCm && form.heightCm && form.paddingCm && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-200">
                <span className="font-semibold">Espacio útil interior:</span>{" "}
                {Math.max(0, parseFloat(form.lengthCm) - parseFloat(form.paddingCm) * 2).toFixed(0)} ×{" "}
                {Math.max(0, parseFloat(form.widthCm) - parseFloat(form.paddingCm) * 2).toFixed(0)} ×{" "}
                {Math.max(0, parseFloat(form.heightCm) - parseFloat(form.paddingCm) * 2).toFixed(0)} cm
                {" "}={" "}
                {(
                  Math.max(0, parseFloat(form.lengthCm) - parseFloat(form.paddingCm) * 2) *
                  Math.max(0, parseFloat(form.widthCm) - parseFloat(form.paddingCm) * 2) *
                  Math.max(0, parseFloat(form.heightCm) - parseFloat(form.paddingCm) * 2)
                ).toFixed(0)} cm³
              </div>
            )}

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Check className="h-4 w-4" />
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear caja"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de cajas */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando cajas...</div>
      ) : boxes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay cajas cargadas</p>
          <p className="text-gray-400 text-sm mt-1">Creá las cajas estándar para que el checkout calcule el envío</p>
          <Button onClick={openNew} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" /> Crear primera caja
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {boxes.map((box) => (
            <Card key={box.id} className={`border ${box.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{box.name}</h3>
                        <Badge variant={box.isActive ? "default" : "secondary"} className={box.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}>
                          {box.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                        <span>📦 <span className="font-medium">{box.lengthCm}×{box.widthCm}×{box.heightCm} cm</span> exterior</span>
                        <span>🛡️ Relleno: <span className="font-medium">{box.paddingCm} cm</span></span>
                        <span>⚖️ Máx: <span className="font-medium">{box.maxWeightKg} kg</span></span>
                        <span>📬 Caja vacía: <span className="font-medium">{box.boxWeightKg} kg</span></span>
                      </div>
                      <div className="mt-1.5 text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-lg">
                        Espacio útil: {Math.max(0, box.lengthCm - box.paddingCm * 2).toFixed(0)}×{Math.max(0, box.widthCm - box.paddingCm * 2).toFixed(0)}×{Math.max(0, box.heightCm - box.paddingCm * 2).toFixed(0)} cm — {innerVolume(box).toFixed(0)} cm³
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch checked={box.isActive} onCheckedChange={() => toggleActive(box)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(box)} className="h-9 w-9 text-gray-500 hover:text-blue-600">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(box.id)} disabled={deletingId === box.id}
                      className="h-9 w-9 text-gray-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info algoritmo */}
      {boxes.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <p className="font-semibold mb-1">¿Cómo funciona el algoritmo?</p>
          <p>Al momento del checkout, el sistema suma el volumen y peso de todos los productos del carrito, y elige automáticamente la caja activa más pequeña que los contenga. El peso que se manda a AEX incluye el peso de la caja vacía.</p>
        </div>
      )}
    </div>
    </PanelLayout>
  )
}
