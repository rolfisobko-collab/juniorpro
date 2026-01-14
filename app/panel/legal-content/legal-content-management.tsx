"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Search, Edit, Eye, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface LegalContent {
  id: string
  slug: string
  title: string
  content: string
  lastUpdated: string
}

export function LegalContentManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [legalContents, setLegalContents] = useState<LegalContent[]>([])
  const [editingContent, setEditingContent] = useState<LegalContent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/legal-content", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) return

      const data = (await res.json()) as LegalContent[]
      if (!cancelled) setLegalContents(data)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredContents = legalContents.filter(
    (content) =>
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (editingContent) {
      const title = formData.get("title") as string
      const contentText = formData.get("content") as string

      void fetch(`/api/admin/legal/${editingContent.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content: contentText }),
      })

      setLegalContents(
        legalContents.map((content) =>
          content.id === editingContent.id
            ? {
                ...content,
                title,
                content: contentText,
                lastUpdated: new Date().toISOString().split("T")[0],
              }
            : content,
        ),
      )
    }

    setIsDialogOpen(false)
    setEditingContent(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contenido Legal</h1>
          <p className="text-muted-foreground">Gestiona términos, políticas y documentos legales</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar contenido legal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredContents.map((content) => (
          <Card key={content.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{content.title}</CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      /{content.slug}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Última actualización: {content.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/${content.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </Link>
                  <Dialog open={isDialogOpen && editingContent?.id === content.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setEditingContent(content)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar {content.title}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Título</Label>
                          <Input id="title" name="title" defaultValue={content.title} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="slug">URL Slug (solo lectura)</Label>
                          <Input id="slug" name="slug" defaultValue={content.slug} disabled className="bg-muted" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content">Contenido (Markdown)</Label>
                          <Textarea
                            id="content"
                            name="content"
                            defaultValue={content.content}
                            rows={20}
                            className="font-mono text-sm"
                            placeholder="Escribe el contenido en formato Markdown..."
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Usa Markdown para formatear: # para títulos, ** para negrita, - para listas, etc.
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false)
                              setEditingContent(null)
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Guardar Cambios</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {content.content.substring(0, 200).replace(/#/g, "").trim()}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron documentos legales</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
