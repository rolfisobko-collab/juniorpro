"use client"

import PanelLayout from "@/components/panel-layout"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search, CheckCircle, AlertCircle, Loader2, ImageIcon, RefreshCw } from "lucide-react"

interface Brand {
  id: string
  name: string
  image: string | null
}

interface ImageResult {
  url: string
  thumb: string
  title: string
  width: number
  height: number
}

type BrandStatus = "pending" | "searching" | "found" | "saved" | "error" | "no_results"

interface BrandEntry {
  brand: Brand
  status: BrandStatus
  results: ImageResult[]
  selected: string | null
  customQuery: string
}

export default function BrandImagesPage() {
  const [entries, setEntries] = useState<BrandEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoRunning, setAutoRunning] = useState(false)
  const autoRef = useRef(false)
  const { toast } = useToast()

  const saved = entries.filter(e => e.status === "saved").length
  const pending = entries.filter(e => e.status === "pending").length

  const loadBrands = async () => {
    setLoading(true)
    setEntries([])
    setCurrentIndex(0)
    const res = await fetch("/api/admin/brands", { credentials: "include" })
    const data = await res.json()
    const brands: Brand[] = data.brands ?? []
    setEntries(brands.map(b => ({
      brand: b,
      status: "pending",
      results: [],
      selected: null,
      customQuery: `${b.name} logo transparent png`,
    })))
    setLoading(false)
  }

  const searchImages = useCallback(async (index: number, query?: string): Promise<ImageResult[]> => {
    setEntries(prev => {
      const next = [...prev]; next[index] = { ...next[index], status: "searching" }; return next
    })
    const q = query ?? entries[index]?.customQuery ?? ""
    try {
      const res = await fetch(`/api/admin/image-search?q=${encodeURIComponent(q)}`, { credentials: "include" })
      const data = await res.json()
      if (!res.ok || data.error) {
        setEntries(prev => { const next = [...prev]; next[index] = { ...next[index], status: "error" }; return next })
        return []
      }
      const results: ImageResult[] = data.images ?? []
      setEntries(prev => {
        const next = [...prev]
        next[index] = { ...next[index], status: results.length > 0 ? "found" : "no_results", results }
        return next
      })
      return results
    } catch {
      setEntries(prev => { const next = [...prev]; next[index] = { ...next[index], status: "error" }; return next })
      return []
    }
  }, [entries])

  const saveImage = useCallback(async (index: number, imageUrl: string) => {
    const entry = entries[index]
    if (!entry) return
    try {
      const res = await fetch(`/api/admin/brands/${entry.brand.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      })
      if (!res.ok) throw new Error()
      setEntries(prev => {
        const next = [...prev]; next[index] = { ...next[index], status: "saved", selected: imageUrl }; return next
      })
      // Avanzar al siguiente pendiente
      setEntries(prev => {
        const nextIdx = prev.findIndex((e, i) => i > index && (e.status === "pending" || e.status === "found" || e.status === "no_results"))
        if (nextIdx !== -1) setCurrentIndex(nextIdx)
        return prev
      })
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" })
    }
  }, [entries, toast])

  const runAutoMode = async () => {
    autoRef.current = true
    setAutoRunning(true)
    for (let i = 0; i < entries.length; i++) {
      if (!autoRef.current) break
      if (entries[i].status !== "pending") continue
      setCurrentIndex(i)
      const results = await searchImages(i)
      if (results.length > 0) {
        await saveImage(i, results[0].url)
        await new Promise(r => setTimeout(r, 400))
      }
    }
    autoRef.current = false
    setAutoRunning(false)
    toast({ title: "✅ Modo automático terminado" })
  }

  const currentEntry = entries[currentIndex]

  return (
    <PanelLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Imágenes de Marcas</h1>
            <p className="text-sm text-muted-foreground">Buscá y asigná logos a tus marcas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/panel/brands">← Volver a marcas</a>
            </Button>
            <Button onClick={loadBrands} disabled={loading} className="bg-[#009FE3] hover:bg-[#007BB8] text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {loading ? "Cargando..." : "Cargar marcas"}
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="flex gap-3 text-sm flex-wrap">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">✅ {saved} guardados</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">⏳ {pending} pendientes</span>
          </div>
        )}

        {entries.length === 0 && !loading && (
          <div className="text-center py-20 text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>Hacé clic en "Cargar marcas" para empezar</p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Lista de marcas */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Marcas ({entries.length})</span>
                {!autoRunning ? (
                  <Button size="sm" variant="outline" onClick={runAutoMode} className="text-xs h-7">
                    ⚡ Auto
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => { autoRef.current = false; setAutoRunning(false) }} className="text-xs h-7">
                    Detener
                  </Button>
                )}
              </div>
              <div className="overflow-y-auto max-h-[540px]">
                {entries.map((entry, i) => (
                  <button
                    key={entry.brand.id}
                    onClick={() => { setCurrentIndex(i); if (entry.status === "pending") searchImages(i) }}
                    className={`w-full text-left px-4 py-3 border-b flex items-center gap-3 hover:bg-gray-50 transition-colors
                      ${currentIndex === i ? "bg-blue-50 border-l-4 border-l-[#009FE3]" : "border-l-4 border-l-transparent"}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {(entry.selected || entry.brand.image) ? (
                        <img src={entry.selected || entry.brand.image!} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.brand.name}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {entry.status === "saved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {entry.status === "searching" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                      {(entry.status === "error" || entry.status === "no_results") && <AlertCircle className="h-4 w-4 text-red-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de búsqueda */}
            <div className="border rounded-xl p-6 space-y-5">
              {!currentEntry ? (
                <div className="text-center text-muted-foreground py-12">Seleccioná una marca de la lista</div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-bold text-xl">{currentEntry.brand.name}</h2>
                    <Button
                      className="bg-[#009FE3] hover:bg-[#007BB8] text-white"
                      size="sm"
                      onClick={() => searchImages(currentIndex)}
                      disabled={currentEntry.status === "searching" || autoRunning}
                    >
                      {currentEntry.status === "searching"
                        ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Buscando...</>
                        : <><Search className="h-4 w-4 mr-1" /> Buscar imágenes</>}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={currentEntry.customQuery}
                      onChange={e => setEntries(prev => {
                        const next = [...prev]; next[currentIndex] = { ...next[currentIndex], customQuery: e.target.value }; return next
                      })}
                      placeholder="Búsqueda personalizada..."
                      onKeyDown={e => e.key === "Enter" && searchImages(currentIndex, currentEntry.customQuery)}
                    />
                    <Button variant="outline" size="sm" onClick={() => searchImages(currentIndex, currentEntry.customQuery)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {currentEntry.status === "saved" && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" /> Imagen guardada correctamente
                    </div>
                  )}
                  {currentEntry.status === "no_results" && (
                    <div className="text-center py-8 text-orange-500 text-sm">No se encontraron resultados. Probá con otra búsqueda.</div>
                  )}
                  {currentEntry.status === "pending" && (
                    <div className="text-center py-8 text-muted-foreground text-sm">Hacé clic en "Buscar imágenes" para ver sugerencias</div>
                  )}

                  {currentEntry.results.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {currentEntry.results.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => saveImage(currentIndex, img.url)}
                          disabled={autoRunning}
                          className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-white hover:border-[#009FE3] hover:scale-105 transition-all duration-200 group
                            ${currentEntry.selected === img.url ? "border-[#009FE3] ring-2 ring-[#009FE3]/30" : "border-gray-200"}`}
                        >
                          <img
                            src={img.thumb || img.url}
                            alt={img.title}
                            className="w-full h-full object-contain p-2"
                            onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                          />
                          <div className="absolute inset-0 bg-[#009FE3]/0 group-hover:bg-[#009FE3]/10 transition-colors flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-[#009FE3] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
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
