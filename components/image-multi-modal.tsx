"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Star, Image as ImageIcon } from "lucide-react"

interface ImageMultiModalProps {
  product: { id: string; name: string; image?: string; images?: string[] }
  onClose: () => void
  onSave: (primaryUrl: string, allImages: string[]) => Promise<void>
}

const SLOTS = 4

export function ImageMultiModal({ product, onClose, onSave }: ImageMultiModalProps) {
  // Build initial slots from existing images
  const buildSlots = () => {
    const all: string[] = []
    if (product.image) all.push(product.image)
    if (product.images) {
      product.images.forEach(img => { if (img && !all.includes(img)) all.push(img) })
    }
    const slots: string[] = Array(SLOTS).fill("")
    all.slice(0, SLOTS).forEach((img, i) => { slots[i] = img })
    return slots
  }

  const [slots, setSlots] = useState<string[]>(buildSlots)
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const [urlInputs, setUrlInputs] = useState<string[]>(Array(SLOTS).fill(""))
  const [uploading, setUploading] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  // Keep primary index valid — if slot 0 is empty pick first filled
  useEffect(() => {
    if (!slots[primaryIndex]) {
      const firstFilled = slots.findIndex(s => s)
      if (firstFilled !== -1) setPrimaryIndex(firstFilled)
    }
  }, [slots, primaryIndex])

  const handleFileUpload = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) { alert("Máximo 5MB"); return }
    setUploading(index)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) throw new Error("Error al subir")
      const { url } = await res.json()
      const next = [...slots]
      next[index] = url
      setSlots(next)
      if (!slots[primaryIndex]) setPrimaryIndex(index)
    } catch (e) {
      alert("Error al subir imagen")
    } finally {
      setUploading(null)
    }
  }

  const handleUrlSave = (index: number) => {
    const url = urlInputs[index].trim()
    if (!url) return
    const next = [...slots]
    next[index] = url
    setSlots(next)
    const inputs = [...urlInputs]
    inputs[index] = ""
    setUrlInputs(inputs)
    if (!slots[primaryIndex]) setPrimaryIndex(index)
  }

  const handleRemove = (index: number) => {
    const next = [...slots]
    next[index] = ""
    setSlots(next)
    if (primaryIndex === index) {
      const firstFilled = next.findIndex(s => s)
      setPrimaryIndex(firstFilled === -1 ? 0 : firstFilled)
    }
  }

  const handleSave = async () => {
    const filled = slots.filter(s => s)
    if (filled.length === 0) { alert("Agregá al menos una imagen"); return }
    setSaving(true)
    const primary = slots[primaryIndex] || filled[0]
    const allImages = slots.filter(s => s)
    await onSave(primary, allImages)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-bold">Imágenes del producto</h3>
            <p className="text-sm text-gray-500 truncate max-w-sm">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slots */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Podés agregar hasta <strong>4 imágenes</strong>. Hacé clic en la ⭐ para marcar cuál es la <strong>principal</strong>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {slots.map((slot, i) => (
              <div key={i} className="flex flex-col gap-2">
                {/* Image slot */}
                <div
                  className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-gray-50 flex items-center justify-center transition-all
                    ${primaryIndex === i && slot ? "border-[#009FE3] ring-2 ring-[#009FE3]/30" : "border-gray-200"}
                    ${!slot ? "border-dashed" : ""}
                  `}
                >
                  {slot ? (
                    <>
                      <img src={slot} alt={`Imagen ${i + 1}`} className="w-full h-full object-contain p-1" />
                      {/* Primary star badge */}
                      <button
                        onClick={() => setPrimaryIndex(i)}
                        className={`absolute top-1 left-1 rounded-full p-1 shadow transition-all
                          ${primaryIndex === i ? "bg-[#009FE3] text-white scale-110" : "bg-white/80 text-gray-400 hover:text-[#009FE3]"}
                        `}
                        title="Marcar como principal"
                      >
                        <Star className="h-3 w-3" fill={primaryIndex === i ? "currentColor" : "none"} />
                      </button>
                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {/* Primary label */}
                      {primaryIndex === i && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#009FE3] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Principal
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 p-2 text-center">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs">Imagen {i + 1}</span>
                    </div>
                  )}

                  {/* Upload overlay */}
                  {uploading === i && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-[#009FE3]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={el => { fileRefs.current[i] = el }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(i, f) }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  disabled={uploading !== null}
                  onClick={() => fileRefs.current[i]?.click()}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {slot ? "Reemplazar" : "Subir"}
                </Button>

                {/* URL input */}
                <div className="flex gap-1">
                  <Input
                    type="url"
                    placeholder="Pegar URL"
                    className="h-7 text-xs px-2"
                    value={urlInputs[i]}
                    onChange={e => { const v = [...urlInputs]; v[i] = e.target.value; setUrlInputs(v) }}
                    onKeyDown={e => { if (e.key === "Enter") handleUrlSave(i) }}
                  />
                  {urlInputs[i] && (
                    <Button type="button" size="sm" className="h-7 px-2 text-xs bg-[#009FE3] hover:bg-[#007BB8]" onClick={() => handleUrlSave(i)}>
                      OK
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <span className="text-sm text-gray-500">
            {slots.filter(s => s).length} de {SLOTS} imágenes · Principal: imagen {primaryIndex + 1}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || slots.every(s => !s)}
              className="bg-[#009FE3] hover:bg-[#007BB8] text-white"
            >
              {saving ? "Guardando..." : "Guardar imágenes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
