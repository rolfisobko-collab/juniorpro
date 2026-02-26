"use client"

import PanelLayout from "@/components/panel-layout"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search, CheckCircle, SkipForward, AlertCircle, Loader2, ImageOff, Zap, RefreshCw } from "lucide-react"

interface Product {
  id: string
  name: string
  brand: string
  categoryKey: string
  image: string
}

interface ImageResult {
  url: string
  thumb: string
  title: string
  width: number
  height: number
}

type ProductStatus = "pending" | "searching" | "found" | "saved" | "skipped" | "error" | "no_results"

interface ProductEntry {
  product: Product
  status: ProductStatus
  results: ImageResult[]
  selected: string | null
  customQuery: string
  brokenImage?: boolean
}

const BATCH_LOAD = 100
const LIST_PAGE_SIZE = 50

export default function BulkImagesPage() {
  const [entries, setEntries] = useState<ProductEntry[]>([])
  const [total, setTotal] = useState(0)
  const [totalWithoutImage, setTotalWithoutImage] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [filterMode, setFilterMode] = useState<"without" | "all" | "broken">("without")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [listPage, setListPage] = useState(1)
  const [autoRunning, setAutoRunning] = useState(false)
  const autoRef = useRef(false)
  const { toast } = useToast()

  // Stats
  const saved = entries.filter(e => e.status === "saved").length
  const skipped = entries.filter(e => e.status === "skipped").length
  const errors = entries.filter(e => e.status === "error" || e.status === "no_results").length
  const pending = entries.filter(e => e.status === "pending").length

  // Paginated slice for the left list
  const brokenCount = entries.filter(e => e.brokenImage).length
  const filteredEntries = filterMode === "broken" ? entries.filter(e => e.brokenImage) : entries
  const listTotalPages = Math.max(1, Math.ceil(filteredEntries.length / LIST_PAGE_SIZE))
  const pagedEntries = filteredEntries.slice((listPage - 1) * LIST_PAGE_SIZE, listPage * LIST_PAGE_SIZE)

  // Sync listPage when currentIndex changes so the active item stays visible
  useEffect(() => {
    const posInFiltered = filteredEntries.findIndex(e => e.product.id === entries[currentIndex]?.product.id)
    if (posInFiltered === -1) return
    const targetPage = Math.floor(posInFiltered / LIST_PAGE_SIZE) + 1
    setListPage(targetPage)
  }, [currentIndex])

  const loadProducts = async () => {
    setLoadingProducts(true)
    setEntries([])
    setLoaded(0)
    setCurrentIndex(0)
    setListPage(1)

    let page = 1
    let totalPages = 1
    const allEntries: ProductEntry[] = []
    const noImageParam = filterMode === "without" ? "&noImage=true" : ""

    while (page <= totalPages) {
      const res = await fetch(`/api/admin/products?page=${page}&pageSize=${BATCH_LOAD}${noImageParam}`, { credentials: "include" })
      if (!res.ok) break
      const data = await res.json()
      totalPages = data.totalPages ?? 1
      setTotal(data.total ?? 0)
      if (data.totalWithoutImage !== undefined) setTotalWithoutImage(data.totalWithoutImage)

      const newProducts: Product[] = (data.products ?? []).map((p: any) => ({
        id: p.id, name: p.name, brand: p.brand ?? "", categoryKey: p.categoryKey ?? "", image: p.image ?? ""
      }))

      const newEntries: ProductEntry[] = newProducts.map(p => ({
        product: p,
        status: "pending",
        results: [],
        selected: null,
        customQuery: `${p.brand} ${p.name}`.trim(),
      }))

      allEntries.push(...newEntries)
      setEntries(prev => {
        const existingIds = new Set(prev.map(e => e.product.id))
        return [...prev, ...newEntries.filter(e => !existingIds.has(e.product.id))]
      })
      setLoaded(prev => prev + data.products.length)
      page++
      await new Promise(r => setTimeout(r, 60))
    }

    setLoadingProducts(false)
    if (allEntries.length === 0) {
      toast({ title: "Sin productos", description: filterMode === "without" ? "Todos los productos ya tienen imagen." : "No hay productos." })
    }
  }

  const searchImages = useCallback(async (index: number, query?: string): Promise<ImageResult[]> => {
    setEntries(prev => {
      const next = [...prev]
      next[index] = { ...next[index], status: "searching" }
      return next
    })

    const q = query ?? entries[index]?.product.name ?? ""
    try {
      const res = await fetch(`/api/admin/image-search?q=${encodeURIComponent(q)}`, { credentials: "include" })
      const data = await res.json()

      if (!res.ok || data.error) {
        setEntries(prev => {
          const next = [...prev]
          next[index] = { ...next[index], status: "error" }
          return next
        })
        return []
      }

      const results: ImageResult[] = data.images ?? []
      setEntries(prev => {
        const next = [...prev]
        next[index] = {
          ...next[index],
          status: results.length > 0 ? "found" : "no_results",
          results,
        }
        return next
      })
      return results
    } catch {
      setEntries(prev => {
        const next = [...prev]
        next[index] = { ...next[index], status: "error" }
        return next
      })
      return []
    }
  }, [entries])

  const saveImage = useCallback(async (index: number, imageUrl: string) => {
    const entry = entries[index]
    if (!entry) return
    try {
      const res = await fetch("/api/admin/products/update-simple", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: entry.product.id, image: imageUrl }),
      })
      if (!res.ok) throw new Error()
      setEntries(prev => {
        const next = [...prev]
        next[index] = { ...next[index], status: "saved", selected: imageUrl }
        return next
      })
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" })
    }
  }, [entries, toast])

  const skipProduct = (index: number) => {
    setEntries(prev => {
      const next = [...prev]
      next[index] = { ...next[index], status: "skipped" }
      return next
    })
    goNext(index)
  }

  const goNext = useCallback((from: number) => {
    setEntries(prev => {
      const nextIdx = prev.findIndex((e, i) => i > from && (e.status === "pending" || e.status === "found" || e.status === "no_results" || e.status === "error"))
      if (nextIdx !== -1) setCurrentIndex(nextIdx)
      return prev
    })
  }, [])

  // Auto mode: search + pick first image for all pending
  const runAutoMode = async () => {
    autoRef.current = true
    setAutoRunning(true)

    for (let i = 0; i < entries.length; i++) {
      if (!autoRef.current) break
      const entry = entries[i]
      if (entry.status !== "pending") continue

      setCurrentIndex(i)
      const results = await searchImages(i)
      if (results.length > 0) {
        await saveImage(i, results[0].url)
        await new Promise(r => setTimeout(r, 300))
      }
    }

    autoRef.current = false
    setAutoRunning(false)
    toast({ title: "✅ Modo automático terminado" })
  }

  const stopAuto = () => {
    autoRef.current = false
    setAutoRunning(false)
  }

  const currentEntry = entries[currentIndex]

  return (
    <PanelLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Carga masiva de imágenes</h1>
            <p className="text-sm text-muted-foreground">Buscá y asigná imágenes a tus productos rápidamente</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              <button
                onClick={() => setFilterMode("without")}
                className={`px-4 py-2 font-medium transition-colors ${filterMode === "without" ? "bg-[#009FE3] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                title="Productos con imagen placeholder (sin URL real)"
              >
                Sin imagen
              </button>
              <button
                onClick={() => { setFilterMode("broken"); setListPage(1) }}
                className={`px-4 py-2 font-medium transition-colors border-l border-gray-200 ${filterMode === "broken" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                title="Productos cargados cuya imagen no se puede mostrar (URL rota)"
              >
                Rotas {brokenCount > 0 && <span className="ml-1 bg-white/30 rounded-full px-1">{brokenCount}</span>}
              </button>
              <button
                onClick={() => setFilterMode("all")}
                className={`px-4 py-2 font-medium transition-colors border-l border-gray-200 ${filterMode === "all" ? "bg-[#009FE3] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                title="Todos los productos"
              >
                Todos
              </button>
            </div>
            <Button onClick={loadProducts} disabled={loadingProducts} className="bg-[#009FE3] hover:bg-[#007BB8] text-white">
              {loadingProducts ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {loadingProducts ? `Cargando... ${loaded}/${total}` : "Cargar productos"}
            </Button>
          </div>
        </div>

        {/* Global counters */}
        <div className="flex gap-3 flex-wrap text-sm">
          <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">📦 Total: {total > 0 ? total : "—"}</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">🖼️ Sin imagen: {totalWithoutImage > 0 ? totalWithoutImage : "—"}</span>
          {entries.length > 0 && <span className="px-3 py-1 bg-gray-100 rounded-full">📋 En lista: {entries.length}</span>}
        </div>

        {/* Session stats */}
        {entries.length > 0 && (
          <div className="flex gap-3 flex-wrap text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">✅ {saved} guardados</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">⏭ {skipped} omitidos</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">❌ {errors} sin resultado</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">⏳ {pending} pendientes</span>
          </div>
        )}

        {entries.length === 0 && !loadingProducts && (
          <div className="text-center py-20 text-muted-foreground">
            <ImageOff className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>Hacé clic en "Cargar productos" para empezar</p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* Left: product list */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Productos</span>
                {!autoRunning ? (
                  <Button size="sm" variant="outline" onClick={runAutoMode} className="text-xs h-7 gap-1">
                    <Zap className="h-3 w-3" /> Auto
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={stopAuto} className="text-xs h-7">
                    Detener
                  </Button>
                )}
              </div>
              <div className="overflow-y-auto max-h-[540px]">
                {pagedEntries.map((entry) => {
                  const i = entries.indexOf(entry)
                  return (
                  <button
                    key={entry.product.id}
                    onClick={() => { setCurrentIndex(i); if (entry.status === "pending") searchImages(i) }}
                    className={`w-full text-left px-4 py-3 border-b flex items-center gap-3 hover:bg-gray-50 transition-colors
                      ${currentIndex === i ? "bg-blue-50 border-l-4 border-l-[#009FE3]" : "border-l-4 border-l-transparent"}
                    `}
                  >
                    {/* Thumbnail */}
                    <div className={`w-10 h-10 rounded-lg bg-white border overflow-hidden flex-shrink-0 ${entry.brokenImage && entry.status !== "saved" ? "border-orange-300" : ""}`}>
                      {entry.status === "saved" && entry.selected ? (
                        <img src={entry.selected} alt="" className="w-full h-full object-contain" />
                      ) : entry.product.image && entry.product.image.startsWith("http") ? (
                        <img
                          src={entry.product.image}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={() => setEntries(prev => {
                            const idx = prev.findIndex(e => e.product.id === entry.product.id)
                            if (idx === -1 || prev[idx].brokenImage) return prev
                            const next = [...prev]
                            next[idx] = { ...next[idx], brokenImage: true }
                            return next
                          })}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageOff className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{entry.product.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{entry.product.brand}</p>
                    </div>
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {entry.status === "saved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {entry.status === "skipped" && <SkipForward className="h-4 w-4 text-gray-400" />}
                      {entry.status === "searching" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                      {(entry.status === "error" || entry.status === "no_results") && <AlertCircle className="h-4 w-4 text-red-400" />}
                    </div>
                  </button>
                  )
                })}
              </div>
              {/* List pagination */}
              {listTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-xs">
                  <button
                    onClick={() => setListPage(p => Math.max(1, p - 1))}
                    disabled={listPage === 1}
                    className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-white transition-colors"
                  >
                    ← Ant
                  </button>
                  <span className="text-gray-500">{listPage} / {listTotalPages}</span>
                  <button
                    onClick={() => setListPage(p => Math.min(listTotalPages, p + 1))}
                    disabled={listPage === listTotalPages}
                    className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-white transition-colors"
                  >
                    Sig →
                  </button>
                </div>
              )}
            </div>

            {/* Right: current product detail */}
            <div className="border rounded-xl p-6 space-y-5">
              {!currentEntry ? (
                <div className="text-center text-muted-foreground py-12">Seleccioná un producto de la lista</div>
              ) : (
                <>
                  {/* Product header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-lg leading-tight">{currentEntry.product.name}</h2>
                      <p className="text-sm text-muted-foreground">{currentEntry.product.brand}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => skipProduct(currentIndex)}
                        disabled={autoRunning}
                      >
                        <SkipForward className="h-4 w-4 mr-1" /> Omitir
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#009FE3] hover:bg-[#007BB8] text-white"
                        onClick={() => searchImages(currentIndex)}
                        disabled={currentEntry.status === "searching" || autoRunning}
                      >
                        {currentEntry.status === "searching"
                          ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Buscando...</>
                          : <><Search className="h-4 w-4 mr-1" /> Buscar imágenes</>
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Custom query */}
                  <div className="flex gap-2">
                    <Input
                      value={currentEntry.customQuery}
                      onChange={e => setEntries(prev => {
                        const next = [...prev]
                        next[currentIndex] = { ...next[currentIndex], customQuery: e.target.value }
                        return next
                      })}
                      placeholder="Búsqueda personalizada..."
                      className="text-sm"
                      onKeyDown={e => e.key === "Enter" && searchImages(currentIndex, currentEntry.customQuery)}
                    />
                    <Button variant="outline" size="sm" onClick={() => searchImages(currentIndex, currentEntry.customQuery)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status messages */}
                  {currentEntry.status === "pending" && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Hacé clic en "Buscar imágenes" para ver sugerencias
                    </div>
                  )}
                  {currentEntry.status === "no_results" && (
                    <div className="text-center py-8 text-orange-500 text-sm">
                      No se encontraron imágenes. Probá con otra búsqueda.
                    </div>
                  )}
                  {currentEntry.status === "error" && (
                    <div className="text-center py-8 text-red-500 text-sm">
                      Error en la búsqueda. Intentá de nuevo.
                    </div>
                  )}
                  {currentEntry.status === "saved" && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" /> Imagen guardada correctamente
                    </div>
                  )}

                  {/* Image results grid */}
                  {currentEntry.results.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {currentEntry.results.map((img, i) => (
                        <button
                          key={i}
                          onClick={async () => {
                            await saveImage(currentIndex, img.url)
                            goNext(currentIndex)
                          }}
                          disabled={autoRunning}
                          className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-white hover:border-[#009FE3] hover:scale-105 transition-all duration-200 group
                            ${currentEntry.selected === img.url ? "border-[#009FE3] ring-2 ring-[#009FE3]/30" : "border-gray-200"}
                          `}
                        >
                          <img
                            src={img.thumb || img.url}
                            alt={img.title}
                            className="w-full h-full object-contain p-1"
                            onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                          />
                          <div className="absolute inset-0 bg-[#009FE3]/0 group-hover:bg-[#009FE3]/10 transition-colors flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-[#009FE3] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                          {img.width && (
                            <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] px-1 rounded">
                              {img.width}×{img.height}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  )
}
