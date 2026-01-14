"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Upload, X } from "lucide-react"
import PanelLayout from "@/components/panel-layout"

interface BrandingConfig {
  siteName: string
  logoText: string
  logoImage?: string | null
  faviconImage?: string | null
  primaryColor?: string | null
  updatedAt?: string
}

function BrandingManagementContent() {
  const [branding, setBranding] = useState<BrandingConfig>({
    siteName: "",
    logoText: "",
    logoImage: "",
    faviconImage: "",
    primaryColor: "",
  })
  const [previewImage, setPreviewImage] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/settings/branding", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) return

      const data = (await res.json()) as BrandingConfig
      if (cancelled) return

      setBranding(data)
      if (data.logoImage) setPreviewImage(data.logoImage)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
        setBranding((prev) => ({ ...prev, logoImage: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage("")
    setBranding((prev) => ({ ...prev, logoImage: "" }))
  }

  const handleSave = () => {
    setIsSaving(true)
    void (async () => {
      try {
        const res = await fetch("/api/admin/settings/branding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            siteName: branding.siteName,
            logoText: branding.logoText,
            logoImage: branding.logoImage ?? "",
            faviconImage: branding.faviconImage ?? "",
            primaryColor: branding.primaryColor ?? "",
          }),
        })

        if (!res.ok) return

        window.dispatchEvent(new Event("branding-updated"))
      } finally {
        setIsSaving(false)
      }
    })()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Branding y Logo</h1>
        <p className="text-muted-foreground mt-2">Personaliza el logo y la identidad visual de tu tienda</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Nombre y texto del logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nombre del Sitio</Label>
              <Input
                id="siteName"
                value={branding.siteName}
                onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                placeholder="TechZone"
              />
              <p className="text-xs text-muted-foreground">Aparece en el header y sidebar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoText">Texto del Logo (letra)</Label>
              <Input
                id="logoText"
                value={branding.logoText}
                onChange={(e) => setBranding({ ...branding, logoText: e.target.value })}
                placeholder="T"
                maxLength={2}
              />
              <p className="text-xs text-muted-foreground">Una o dos letras que aparecerán si no hay imagen de logo</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo (Imagen)</CardTitle>
            <CardDescription>Sube una imagen personalizada para el logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vista Previa</Label>
              <div className="border-2 border-dashed rounded-lg p-8 flex items-center justify-center min-h-[200px] bg-muted/30">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-[150px] max-w-[150px] object-contain rounded-lg"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary via-primary to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xl">
                      <span className="text-primary-foreground font-bold text-2xl">{branding.logoText}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Logo por defecto con texto</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUpload">Subir Logo</Label>
              <div className="flex gap-2">
                <Input id="logoUpload" type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => document.getElementById("logoUpload")?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recomendado: PNG transparente, 512x512px o similar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista Previa en Diferentes Contextos</CardTitle>
          <CardDescription>Cómo se verá el logo en distintas partes del sitio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Header Principal</Label>
              <div className="border rounded-lg p-4 bg-background">
                <div className="flex items-center space-x-2">
                  {previewImage ? (
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="h-10 w-10 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-blue-600 flex items-center justify-center shadow-xl">
                      <span className="text-primary-foreground font-bold text-xl">{branding.logoText}</span>
                    </div>
                  )}
                  <span className="font-sans text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                    {branding.siteName}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sidebar Admin</Label>
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center space-x-2">
                  {previewImage ? (
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="h-8 w-8 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">{branding.logoText}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-xl text-primary">{branding.siteName}</span>
                    <p className="text-xs text-muted-foreground">Panel de Control</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  )
}

export default function BrandingManagementPage() {
  return (
    <PanelLayout>
      <BrandingManagementContent />
    </PanelLayout>
  )
}
