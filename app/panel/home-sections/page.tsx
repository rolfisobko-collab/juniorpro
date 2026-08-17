"use client"

import { useEffect, useMemo, useState } from "react"
import PanelLayout from "@/components/panel-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Loader2, Plus, Search, Trash2 } from "lucide-react"

type ProductPreview = {
  id: string
  name: string
  brand?: string
  price: number
  image?: string
}

type HomeSection = {
  id: string
  title: string
  subtitle: string
  eyebrow: string
  href: string
  bg: "white" | "gray"
  position: number
  active: boolean
  mode: "manual" | "auto"
  productIds: string[]
  selectedProducts?: ProductPreview[]
}

function money(value: number) {
  return `$ ${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
}

function MiniProduct({
  product,
  compact = false,
  onRemove,
}: {
  product: ProductPreview
  compact?: boolean
  onRemove?: () => void
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#009FE3]/30 hover:shadow-md ${compact ? "p-2" : "p-3"}`}>
      <div className="flex gap-3">
        <div className={`${compact ? "h-14 w-14" : "h-20 w-20"} shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white`}>
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1.5" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-gray-300">IMG</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-[#009FE3]">{product.brand || "Producto"}</p>
          <p className={`${compact ? "text-xs" : "text-sm"} mt-1 line-clamp-2 font-bold leading-snug text-gray-950`}>{product.name}</p>
          <p className="mt-1 text-sm font-black text-gray-900">{money(product.price)}</p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-300 shadow-sm transition hover:bg-red-50 hover:text-red-500"
            title="Quitar producto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<ProductPreview[]>([])
  const [activeSectionId, setActiveSectionId] = useState("")
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null)

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) || sections[0],
    [sections, activeSectionId],
  )

  const loadSections = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/home-sections", { credentials: "include", cache: "no-store" })
      const data = await res.json()
      const loaded = (data.sections || []).sort((a: HomeSection, b: HomeSection) => a.position - b.position)
      setSections(loaded)
      setActiveSectionId((current) => current || loaded[0]?.id || "")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSections()
  }, [])

  useEffect(() => {
    const term = search.trim()
    if (term.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/admin/products?search=${encodeURIComponent(term)}&page=1&pageSize=18`, {
          credentials: "include",
          cache: "no-store",
        })
        const data = await res.json()
        setResults((data.products || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image,
        })))
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const updateSection = (id: string, patch: Partial<HomeSection>) => {
    setSections((current) => current.map((section) => (section.id === id ? { ...section, ...patch } : section)))
  }

  const productIdsFor = (section: HomeSection) =>
    section.productIds.length ? section.productIds : (section.selectedProducts || []).map((product) => product.id)

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections((current) => {
      const index = current.findIndex((section) => section.id === id)
      const target = index + dir
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next.map((section, position) => ({ ...section, position: position + 1 }))
    })
  }

  const addProduct = (product: ProductPreview) => {
    if (!activeSection) return
    const currentIds = productIdsFor(activeSection)
    if (currentIds.includes(product.id)) return
    updateSection(activeSection.id, {
      mode: "manual",
      productIds: [...currentIds, product.id],
      selectedProducts: [...(activeSection.selectedProducts || []), product],
    })
  }

  const removeProduct = (productId: string) => {
    if (!activeSection) return
    const currentIds = productIdsFor(activeSection)
    updateSection(activeSection.id, {
      mode: "manual",
      productIds: currentIds.filter((id) => id !== productId),
      selectedProducts: (activeSection.selectedProducts || []).filter((product) => product.id !== productId),
    })
  }

  const moveProduct = (productId: string, dir: -1 | 1) => {
    if (!activeSection) return
    const currentIds = productIdsFor(activeSection)
    const index = currentIds.indexOf(productId)
    const target = index + dir
    if (index < 0 || target < 0 || target >= currentIds.length) return

    const ids = [...currentIds]
    const [id] = ids.splice(index, 1)
    ids.splice(target, 0, id)

    const selectedProducts = ids
      .map((itemId) => (activeSection.selectedProducts || []).find((product) => product.id === itemId))
      .filter(Boolean) as ProductPreview[]

    updateSection(activeSection.id, { mode: "manual", productIds: ids, selectedProducts })
  }

  const reorderProductByDrop = (targetProductId: string) => {
    if (!activeSection || !draggedProductId || draggedProductId === targetProductId) return
    const ids = [...productIdsFor(activeSection)]
    const from = ids.indexOf(draggedProductId)
    const to = ids.indexOf(targetProductId)
    if (from < 0 || to < 0) return
    const [id] = ids.splice(from, 1)
    ids.splice(to, 0, id)
    const selectedProducts = ids
      .map((itemId) => (activeSection.selectedProducts || []).find((product) => product.id === itemId))
      .filter(Boolean) as ProductPreview[]
    updateSection(activeSection.id, { mode: "manual", productIds: ids, selectedProducts })
    setDraggedProductId(null)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/home-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sections }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo guardar")
      setSections((data.sections || []).sort((a: HomeSection, b: HomeSection) => a.position - b.position))
      alert("Listo, la home se actualizo en local.")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error guardando secciones")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PanelLayout>
        <div className="flex h-[60vh] items-center justify-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          Cargando secciones...
        </div>
      </PanelLayout>
    )
  }

  return (
    <PanelLayout>
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#061827] via-[#0b2b40] to-[#06364f] p-5 text-white shadow-xl shadow-sky-950/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-sky-200">Home editable</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Vidriera de productos</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-100/80">
                Elegi que se muestra en cada bloque de la home. Los productos ya vienen precargados con la seleccion actual.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={loadSections} className="rounded-2xl bg-white/10 text-white hover:bg-white/20">
                Recargar
              </Button>
              <Button onClick={save} disabled={saving} className="rounded-2xl bg-[#009FE3] px-5 hover:bg-[#0088c7]">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveSectionId(section.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setActiveSectionId(section.id)
                }
              }}
              className={`cursor-pointer rounded-[1.65rem] border p-4 text-left transition ${
                activeSection?.id === section.id
                  ? "border-[#009FE3]/50 bg-white shadow-lg shadow-sky-900/5 ring-4 ring-[#009FE3]/10"
                  : "border-gray-100 bg-white/80 hover:bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#009FE3]/10 text-sm font-black text-[#009FE3]">
                  {index + 1}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); moveSection(section.id, -1) }}
                    disabled={index === 0}
                    className="rounded-xl p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); moveSection(section.id, 1) }}
                    disabled={index === sections.length - 1}
                    className="rounded-xl p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[#009FE3]">{section.eyebrow || "Seccion"}</p>
              <h2 className="mt-1 line-clamp-1 text-lg font-black text-gray-950">{section.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{section.subtitle || "Sin subtitulo"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={section.active ? "default" : "secondary"}>{section.active ? "Visible" : "Oculta"}</Badge>
                <Badge variant="outline">{(section.selectedProducts || []).length || section.productIds.length} productos</Badge>
                <Badge variant="outline">{section.mode === "manual" ? "Manual" : "Auto"}</Badge>
              </div>
            </div>
          ))}
        </div>

        {activeSection && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <main className="space-y-5">
              <section className="rounded-[1.8rem] bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Editar bloque</p>
                    <h2 className="mt-1 text-xl font-black text-gray-950">{activeSection.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateSection(activeSection.id, { active: !activeSection.active })}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                    >
                      {activeSection.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {activeSection.active ? "Visible" : "Oculta"}
                    </button>
                    <select
                      value={activeSection.mode}
                      onChange={(event) => updateSection(activeSection.id, { mode: event.target.value as "manual" | "auto" })}
                      className="rounded-2xl border border-gray-100 bg-white px-3 py-2 text-sm font-bold text-gray-600 outline-none transition focus:border-[#009FE3]"
                    >
                      <option value="manual">Manual</option>
                      <option value="auto">Automatico</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Titulo</span>
                    <Input value={activeSection.title} onChange={(event) => updateSection(activeSection.id, { title: event.target.value })} className="rounded-2xl" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Texto chico</span>
                    <Input value={activeSection.eyebrow} onChange={(event) => updateSection(activeSection.id, { eyebrow: event.target.value })} className="rounded-2xl" />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Subtitulo</span>
                    <Input value={activeSection.subtitle} onChange={(event) => updateSection(activeSection.id, { subtitle: event.target.value })} className="rounded-2xl" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Link Ver todo</span>
                    <Input value={activeSection.href} onChange={(event) => updateSection(activeSection.id, { href: event.target.value })} className="rounded-2xl" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Fondo en home</span>
                    <select
                      value={activeSection.bg}
                      onChange={(event) => updateSection(activeSection.id, { bg: event.target.value as "white" | "gray" })}
                      className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none transition focus:border-[#009FE3]"
                    >
                      <option value="white">Blanco</option>
                      <option value="gray">Gris suave</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="rounded-[1.8rem] bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#009FE3]">Productos</p>
                    <h2 className="mt-1 text-xl font-black text-gray-950">Orden de la seccion</h2>
                    <p className="text-sm text-gray-500">Estos son los productos de la seccion. Podes arrastrar, subir, bajar o quitar.</p>
                  </div>
                  <Badge variant="outline" className="w-fit rounded-full px-3 py-1">{(activeSection.selectedProducts || []).length} elegidos</Badge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeSection.selectedProducts || []).map((product, index) => (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={() => setDraggedProductId(product.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => reorderProductByDrop(product.id)}
                      className="rounded-3xl bg-gray-50 p-2"
                    >
                      <div className="mb-2 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400">
                          <GripVertical className="h-4 w-4" />
                          #{index + 1}
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveProduct(product.id, -1)} disabled={index === 0} className="rounded-lg p-1 text-gray-400 hover:bg-white disabled:opacity-30">
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => moveProduct(product.id, 1)} disabled={index === (activeSection.selectedProducts || []).length - 1} className="rounded-lg p-1 text-gray-400 hover:bg-white disabled:opacity-30">
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <MiniProduct product={product} onRemove={() => removeProduct(product.id)} />
                    </div>
                  ))}
                </div>
              </section>

              <section className={`rounded-[1.8rem] p-4 shadow-sm ring-1 ring-gray-100 sm:p-5 ${activeSection.bg === "gray" ? "bg-[#f8f9fc]" : "bg-white"}`}>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#009FE3]">{activeSection.eyebrow || "Destacados"}</p>
                    <h2 className="mt-1 text-2xl font-black text-gray-950">{activeSection.title}</h2>
                  </div>
                  <span className="hidden text-xs font-black uppercase tracking-[0.16em] text-gray-300 sm:inline">
                    Preview completo
                  </span>
                </div>
                <div className="grid max-h-[560px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-5">
                  {(activeSection.selectedProducts || []).map((product) => (
                    <div key={product.id} className="rounded-2xl border border-gray-100 bg-white p-2">
                      <div className="aspect-square rounded-xl bg-gray-50 p-2">
                        {product.image && <img src={product.image} alt={product.name} className="h-full w-full object-contain" />}
                      </div>
                      <p className="mt-2 truncate text-[10px] font-black uppercase tracking-wider text-[#009FE3]">{product.brand || "Producto"}</p>
                      <p className="line-clamp-2 text-xs font-bold text-gray-900">{product.name}</p>
                      <p className="mt-1 text-sm font-black">{money(product.price)}</p>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <aside className="xl:sticky xl:top-4 xl:self-start">
              <div className="rounded-[1.8rem] bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
                <h2 className="text-lg font-black text-gray-950">Agregar productos</h2>
                <p className="mt-1 text-sm text-gray-500">Busca por nombre, codigo o marca y sumalo a la seccion activa.</p>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar producto..." className="rounded-2xl pl-9" />
                </div>

                <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
                  {searching && (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando...
                    </div>
                  )}
                  {!searching && results.map((product) => {
                    const exists = productIdsFor(activeSection).includes(product.id)
                    return (
                      <div key={product.id} className="flex items-center gap-2 rounded-2xl border border-gray-100 p-2">
                        <div className="min-w-0 flex-1">
                          <MiniProduct product={product} compact />
                        </div>
                        <button
                          type="button"
                          onClick={() => addProduct(product)}
                          disabled={exists}
                          className="rounded-2xl bg-[#009FE3] p-2.5 text-white transition hover:bg-[#0088c7] disabled:bg-gray-200"
                          title={exists ? "Ya esta agregado" : "Agregar"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                  {!searching && search.trim().length < 2 && (
                    <div className="rounded-2xl bg-gray-50 p-5 text-center text-sm text-gray-400">
                      Escribi al menos 2 letras para buscar.
                    </div>
                  )}
                  {!searching && search.trim().length >= 2 && !results.length && (
                    <div className="rounded-2xl bg-gray-50 p-5 text-center text-sm text-gray-400">
                      No encontre productos con ese texto.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PanelLayout>
  )
}
