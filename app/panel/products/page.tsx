"use client"

import type React from "react"
import PanelLayout from "@/components/panel-layout"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, Building, Eye, Upload, Image as ImageIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BrandsModal } from "@/components/brands-modal"
import { ImageLinkModal } from "@/components/image-link-modal"
import { ImageMultiModal } from "@/components/image-multi-modal"
import { ImageUpload } from "@/components/image-upload"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  brand: string
  rating: number
  reviews: number
  inStock: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSubcategory, setFilterSubcategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const loadAbortRef = useRef<boolean>(false)
  const PAGE_SIZE = 50
  const BATCH_SIZE = 100
  const [isBrandsModalOpen, setIsBrandsModalOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [pendingImport, setPendingImport] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [extractedProducts, setExtractedProducts] = useState<any[]>([])
  const [imageModalProduct, setImageModalProduct] = useState<Product | null>(null)
  const [updatedProductId, setUpdatedProductId] = useState<string | null>(null)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  // Cargar categorías y marcas desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar categorías
        const categoriesRes = await fetch('/api/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
          // Extraer todas las subcategorías
          const allSubs: any[] = []
          categoriesData.forEach((cat: any) => {
            if (cat.subcategories) {
              cat.subcategories.forEach((sub: any) => {
                allSubs.push({ ...sub, categoryKey: cat.key, categoryName: cat.name })
              })
            }
          })
          setSubcategories(allSubs)
        }

        // Cargar marcas (mock por ahora)
        const mockBrands = [
          { id: "1", name: "Apple" },
          { id: "2", name: "Samsung" },
          { id: "3", name: "Nike" },
          { id: "4", name: "Sony" },
          { id: "5", name: "LG" },
          { id: "6", name: "Dior" },
          { id: "7", name: "Chanel" },
        ]
        setBrands(mockBrands)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  const mapProduct = (p: any, cats: any[]) => {
    const category = cats.find((c) => c.key === p.categoryKey)
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      description: p.description,
      price: p.price,
      category: category?.name || p.categoryKey || 'Sin categoría',
      image: p.image || p.images?.[0] || '',
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      inStock: p.inStock ?? true,
    } as Product
  }

  const loadAllProducts = async (search: string, cats: any[]) => {
    loadAbortRef.current = true // signal any previous load to stop
    const abortToken = {}
    loadAbortRef.current = false
    
    setProducts([])
    setTotalProducts(0)
    setLoadProgress(0)
    setIsLoading(true)
    setCurrentPage(1)

    try {
      // First batch — get total count too
      const firstRes = await fetch(
        `/api/admin/products?search=${encodeURIComponent(search)}&page=1&pageSize=${BATCH_SIZE}`,
        { credentials: "include" }
      )
      if (!firstRes.ok) {
        const err = await firstRes.json()
        toast({ title: "Error al cargar productos", description: err.error || "Error desconocido", variant: "destructive" })
        setIsLoading(false)
        return
      }
      const firstData = await firstRes.json() as { products: any[]; total: number; totalPages: number }
      const total = firstData.total ?? 0
      const totalPages = firstData.totalPages ?? 1
      setTotalProducts(total)
      setProducts(firstData.products.map(p => mapProduct(p, cats)))
      setLoadProgress(Math.min(firstData.products.length, total))

      // Load remaining pages sequentially without blocking UI
      for (let page = 2; page <= totalPages; page++) {
        if ((loadAbortRef as any).shouldStop) break
        await new Promise(r => setTimeout(r, 50)) // small pause so UI breathes
        const res = await fetch(
          `/api/admin/products?search=${encodeURIComponent(search)}&page=${page}&pageSize=${BATCH_SIZE}`,
          { credentials: "include" }
        )
        if (!res.ok) break
        const data = await res.json() as { products: any[] }
        const mapped = data.products.map(p => mapProduct(p, cats))
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id))
          const newOnes = mapped.filter(p => !existingIds.has(p.id))
          return [...prev, ...newOnes]
        })
        setLoadProgress(prev => prev + mapped.length)
      }
    } catch (error) {
      console.error('❌ Load error:', error)
      toast({ title: "Error de conexión", description: "No se pudieron cargar los productos", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Reload when search changes (debounced 400ms) or categories load
  useEffect(() => {
    if (categories.length === 0) return
    const timer = setTimeout(() => {
      void loadAllProducts(searchQuery, categories)
    }, searchQuery ? 400 : 0)
    return () => clearTimeout(timer)
  }, [searchQuery, categories])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      filterCategory === "all" || product.category === categories.find(c => c.key === filterCategory)?.name || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Reset page when filters change - handled inline
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "price":
        comparison = a.price - b.price
        break
      case "category":
        comparison = a.category.localeCompare(b.category)
        break
      case "brand":
        comparison = a.brand.localeCompare(b.brand)
        break
      default:
        comparison = a.name.localeCompare(b.name)
    }
    
    return sortOrder === "asc" ? comparison : -comparison
  })

  const paginatedProducts = sortedProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handlePriceDoubleClick = (product: Product) => {
    setEditingPriceId(product.id)
    setEditingPriceValue(product.price.toString())
  }

  const handlePriceChange = (value: string) => {
    // Solo permitir números y punto
    const cleanValue = value.replace(/[^0-9.]/g, '')
    setEditingPriceValue(cleanValue)
  }

  const handlePriceSave = async (productId: string) => {
    const newPrice = parseFloat(editingPriceValue)
    
    if (isNaN(newPrice) || newPrice < 0) {
      toast({
        title: "Error",
        description: "El precio debe ser un número válido mayor o igual a 0",
        variant: "destructive"
      })
      return
    }

    try {
      const res = await fetch(`/api/admin/products/update-simple`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: productId,
          price: newPrice
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al actualizar precio')
      }

      // Actualizar el producto en la lista local
      setProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, price: newPrice }
            : p
        )
      )

      // Animación visual de actualización
      setUpdatedProductId(productId)
      setTimeout(() => setUpdatedProductId(null), 2000)

      toast({
        title: "✅ ¡Precio actualizado!",
        description: `El precio se actualizó a $${newPrice.toLocaleString()}`,
        variant: "default",
      })

      setEditingPriceId(null)
      setEditingPriceValue("")
    } catch (error) {
      console.error('Error updating price:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio",
        variant: "destructive"
      })
    }
  }

  const handlePriceCancel = () => {
    setEditingPriceId(null)
    setEditingPriceValue("")
  }

  const handlePreview = (product: any) => {
    // Abrir producto en nueva pestaña
    window.open(`/products/${product.id}`, '_blank')
  }

  const handleEdit = (product: any) => {
    router.push(`/panel/products/${product.id}/edit`)
  }

  const handleImageModal = (product: Product) => {
    setImageModalProduct(product)
  }

  const handleImageUpdate = async (imageUrl: string) => {
    if (imageModalProduct) {
      try {
        console.log('🔄 Updating product image:', imageModalProduct.id, imageUrl)
        
        const res = await fetch(`/api/admin/products/update-simple`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: imageModalProduct.id,
            image: imageUrl
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          console.error('❌ API Error:', errorData)
          throw new Error(errorData.error || 'Error al actualizar imagen')
        }

        const updatedProduct = await res.json()
        console.log('✅ Product image updated:', updatedProduct)
        
        // Actualizar el producto en la lista local con timestamp para evitar caché
        setProducts(prev => {
          const updated = prev.map(p => 
            p.id === imageModalProduct.id 
              ? { ...p, image: imageUrl }
              : p
          )
          console.log('🔄 Products updated locally:', updated.find(p => p.id === imageModalProduct.id))
          return updated
        })
        
        // Animación visual de actualización
        setUpdatedProductId(imageModalProduct.id)
        setTimeout(() => setUpdatedProductId(null), 2000)
        
        toast({
          title: "✅ ¡Imagen guardada!",
          description: "La imagen se actualizó correctamente en la tabla",
          variant: "default",
        })
        setImageModalProduct(null)
      } catch (error) {
        console.error('Error updating image:', error)
        toast({
          title: "Error",
          description: "No se pudo actualizar la imagen",
          variant: "destructive"
        })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return

    try {
      console.log('🗑️ Deleting product:', id)
      console.log('🆔 ID type:', typeof id, 'ID value:', id)
      
      const res = await fetch(`/api/admin/products/delete-simple`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }), // Enviar el ID en el body
      })

      console.log('📡 Response status:', res.status, res.statusText)

      if (!res.ok) {
        let errorData: any = {}
        try {
          errorData = await res.json()
        } catch (parseError) {
          console.error('❌ Parse error:', parseError)
          errorData = { error: `HTTP ${res.status}: ${res.statusText}` }
        }
        
        console.error('❌ Delete error - Status:', res.status)
        console.error('❌ Delete error - StatusText:', res.statusText)
        console.error('❌ Delete error - ErrorData:', errorData)
        
        toast({ 
          title: "Error al eliminar", 
          description: errorData?.error || errorData?.message || "No se pudo eliminar el producto",
          variant: "destructive" 
        })
        return
      }

      console.log('✅ Product deleted successfully')
      setProducts(products.filter((p) => p.id !== id))
      toast({ title: "Producto eliminado", description: "El producto se ha eliminado del catálogo" })
    } catch (error) {
      console.error('❌ Delete error:', error)
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar el producto",
        variant: "destructive" 
      })
    }
  }

  const handleImportHTML = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await processHTMLFile(file)
  }

  const processHTMLFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.html')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo HTML",
        variant: "destructive"
      })
      return
    }

    setIsImporting(true)
    
    try {
      const text = await file.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      
      // Extraer productos de la tabla HTML
      const table = doc.querySelector('#customers')
      if (!table) {
        throw new Error("No se encontró la tabla de productos en el HTML")
      }

      const rows = table.querySelectorAll('tbody tr')
      const extractedProducts: any[] = []

      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td')
        if (cells.length >= 11) {
          const codigo = cells[0]?.textContent?.trim() || ''
          const foto = cells[1]?.textContent?.trim() || ''
          const descripcion = cells[2]?.textContent?.trim() || ''
          const referencia = cells[3]?.textContent?.trim() || ''
          const referencia2 = cells[4]?.textContent?.trim() || ''
          const localizacion = cells[5]?.textContent?.trim() || ''
          const codigoBarra = cells[6]?.textContent?.trim() || ''
          const codigoF = cells[7]?.textContent?.trim() || ''
          const dep1 = cells[9]?.textContent?.trim() || ''
          const stock = cells[10]?.textContent?.trim() || ''
          const aRetirar = cells[11]?.textContent?.trim() || ''
          
          // Limpiar y convertir el precio (DEP 1)
          const price = parseFloat(dep1.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
          
          // Limpiar y convertir el stock
          const stockQuantity = parseInt(stock.replace(/[^\d]/g, '')) || 0
          
          // Ignorar filas que no son productos (totales, encabezados, etc.)
          if (codigo && descripcion && 
              !codigo.includes('----') && 
              !descripcion.includes('TOTAL') && 
              !descripcion.includes('GRUPO') &&
              !descripcion.includes('*** IMPLANTACAO ***') &&
              codigo.match(/^\d+[\d-]*$/)) {
            
            // Extraer marca de la descripción si es posible
            let brand = 'Importado'
            const descriptionUpper = descripcion.toUpperCase()
            if (descriptionUpper.includes('APPLE')) brand = 'Apple'
            else if (descriptionUpper.includes('SAMSUNG')) brand = 'Samsung'
            else if (descriptionUpper.includes('XIAOMI')) brand = 'Xiaomi'
            else if (descriptionUpper.includes('INFINIX')) brand = 'Infinix'
            else if (descriptionUpper.includes('HONOR')) brand = 'Honor'
            else if (descriptionUpper.includes('ALEXA') || descriptionUpper.includes('AMAZON')) brand = 'Amazon'
            
            // Determinar categoría por palabras clave
            let categoryKey = 'electronics' // Por defecto
            if (descriptionUpper.includes('PERFUME') || descriptionUpper.includes('FRAGANCIA')) {
              categoryKey = 'perfumes'
            } else if (descriptionUpper.includes('CEL') || descriptionUpper.includes('PHONE') || descriptionUpper.includes('IPHONE') || descriptionUpper.includes('SAMSUNG') || descriptionUpper.includes('XIAOMI')) {
              categoryKey = 'electronics' // smartphones está dentro de electronics
            } else if (descriptionUpper.includes('TV') || descriptionUpper.includes('TELEVISOR') || descriptionUpper.includes('REFRIGERADOR') || descriptionUpper.includes('LAVADORA')) {
              categoryKey = 'appliances'
            } else if (descriptionUpper.includes('WATCH') || descriptionUpper.includes('RELOJ')) {
              categoryKey = 'electronics' // smartwatches está dentro de electronics
            } else if (descriptionUpper.includes('AIRPOD') || descriptionUpper.includes('AURICULAR') || descriptionUpper.includes('HEADPHONE')) {
              categoryKey = 'electronics' // auriculares está dentro de electronics
            } else if (descriptionUpper.includes('CAMERA') || descriptionUpper.includes('CÁMARA')) {
              categoryKey = 'electronics' // cámaras está dentro de electronics
            } else if (descriptionUpper.includes('TABLET')) {
              categoryKey = 'electronics' // tablets está dentro de electronics
            } else if (descriptionUpper.includes('SPEAKER') || descriptionUpper.includes('ALTAVOZ')) {
              categoryKey = 'electronics' // audio está dentro de electronics
            } else if (descriptionUpper.includes('CARGADOR') || descriptionUpper.includes('CABLE')) {
              categoryKey = 'electronics' // accesorios está dentro de electronics
            }
            
            extractedProducts.push({
              codigo,
              foto,
              descripcion,
              referencia,
              referencia2,
              localizacion,
              codigoBarra,
              codigoF,
              activo: cells[8]?.textContent?.trim() || '',
              stock: stockQuantity,
              price: price, // Usar el precio de DEP 1
              categoryKey,
              brand,
            })
          }
        }
      })

      if (extractedProducts.length === 0) {
        throw new Error("No se encontraron productos válidos en el archivo")
      }

      console.log(`📦 Found ${extractedProducts.length} products to import`)
      
      // Mostrar previsualización antes de importar
      setExtractedProducts(extractedProducts)
      setShowPreviewDialog(true)
      setIsImporting(false)
      return

    } catch (error) {
      console.error('❌ Import error:', error)
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : 'No se pudieron importar los productos',
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    const htmlFile = files.find(file => file.name.toLowerCase().endsWith('.html'))
    
    if (htmlFile) {
      await processHTMLFile(htmlFile)
    } else {
      toast({
        title: "Error",
        description: "Por favor arrastra un archivo HTML",
        variant: "destructive"
      })
    }
  }

  const handleConfirmPreviewImport = async () => {
    setIsImporting(true)
    
    try {
      // Enviar productos al backend
      const res = await fetch('/api/admin/products/import-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ products: extractedProducts })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al importar productos')
      }

      const result = await res.json()
      
      // Si necesita confirmación por duplicados
      if (result.needsConfirmation) {
        setPendingImport({ products: extractedProducts, result })
        setShowPreviewDialog(false)
        setShowConfirmDialog(true)
        setIsImporting(false)
        return
      }
      
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${result.imported} productos correctamente${result.updated > 0 ? ` y se actualizaron ${result.updated}` : ''}`,
      })

      setShowPreviewDialog(false)
      setExtractedProducts([])
      // Recargar la lista de productos
      window.location.reload()

    } catch (error) {
      console.error('❌ Import error:', error)
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : 'No se pudieron importar los productos',
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!pendingImport) return

    setIsImporting(true)
    try {
      const res = await fetch('/api/admin/products/import-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          products: pendingImport.products,
          confirmUpdate: true // Flag para indicar que se confirmó la actualización
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al importar productos')
      }

      const result = await res.json()
      
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${result.imported} productos y se actualizaron ${result.updated} productos existentes`,
      })

      setShowConfirmDialog(false)
      setPendingImport(null)
      window.location.reload()

    } catch (error) {
      console.error('❌ Confirm import error:', error)
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : 'No se pudieron importar los productos',
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <PanelLayout>
      <div 
        className="p-8"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBrandsModalOpen(true)}>
              <Building className="mr-2 h-4 w-4" />
              Gestionar Marcas
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? 'Importando...' : 'Importar HTML'}
                <input
                  type="file"
                  accept=".html"
                  onChange={handleImportHTML}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </Button>
            <Link href="/panel/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </Link>
          </div>
        </div>

        {/* Zona de drag and drop */}
        <div className="mb-6 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors">
          <input
            type="file"
            accept=".html"
            onChange={handleImportHTML}
            disabled={isImporting}
            className="hidden"
            id="html-file-input"
          />
          <label htmlFor="html-file-input" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Importar productos desde ERP</h3>
          </label>
        </div>

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            />
          </div>

          <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setFilterSubcategory("all"); setCurrentPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.key} value={cat.key}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filterCategory !== "all" && subcategories.filter(s => s.categoryKey === filterCategory).length > 0 && (
            <Select value={filterSubcategory} onValueChange={(v) => { setFilterSubcategory(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Subcategoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las subcategorías</SelectItem>
                {subcategories.filter(s => s.categoryKey === filterCategory).map((sub: any) => (
                  <SelectItem key={sub.id} value={sub.slug}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order as "asc" | "desc")
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nombre A-Z</SelectItem>
              <SelectItem value="name-desc">Nombre Z-A</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="category-asc">Categoría A-Z</SelectItem>
              <SelectItem value="brand-asc">Marca A-Z</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground ml-auto flex items-center gap-2">
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[#009FE3]">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {loadProgress}/{totalProducts}
              </span>
            )}
            {!isLoading && `${filteredProducts.length} de ${totalProducts}`} productos · pág. {currentPage}/{totalPages || 1}
          </span>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-semibold hover:bg-blue-50"
                  >
                    Nombre
                    {sortBy === "name" && (
                      sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortBy !== "name" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("category")}
                    className="h-auto p-0 font-semibold hover:bg-blue-50"
                  >
                    Categoría
                    {sortBy === "category" && (
                      sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortBy !== "category" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("price")}
                    className="h-auto p-0 font-semibold hover:bg-blue-50"
                  >
                    Precio
                    {sortBy === "price" && (
                      sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortBy !== "price" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => {
                const hasNoImage = !product.image || product.image === "" || product.image === "/placeholder.svg"
                return (
                  <TableRow 
                    key={product.id}
                    className={`
                      ${hasNoImage ? "bg-red-50 border-red-200 hover:bg-red-100" : ""}
                      ${updatedProductId === product.id ? "bg-green-50 border-green-300 animate-pulse" : ""}
                    `}
                  >
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                        {hasNoImage ? (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        ) : (
                          <>
                            <img 
                              src={`${product.image}?t=${Date.now()}`} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.fallback-icon');
                                if (fallback) {
                                  (fallback as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                            <div className="fallback-icon hidden">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          </>
                        )}
                        {updatedProductId === product.id && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 animate-bounce">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.name}
                        {hasNoImage && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                            Sin imagen
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2" title={product.description}>
                          {product.description || 'Sin descripción'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell 
  className={`capitalize ${updatedProductId === product.id ? "bg-green-50" : ""}`}
  onDoubleClick={() => handlePriceDoubleClick(product)}
>
  {editingPriceId === product.id ? (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        min="0"
        value={editingPriceValue}
        onChange={(e) => handlePriceChange(e.target.value)}
        onBlur={() => handlePriceSave(product.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handlePriceSave(product.id)
          } else if (e.key === 'Escape') {
            handlePriceCancel()
          }
        }}
        className="w-32 h-8 text-sm"
        autoFocus
      />
      <Button 
        size="sm" 
        onClick={() => handlePriceSave(product.id)}
        className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700"
      >
        ✓
      </Button>
      <Button 
        size="sm" 
        onClick={handlePriceCancel}
        className="h-8 px-2 text-xs bg-gray-600 hover:bg-gray-700"
      >
        ✕
      </Button>
    </div>
  ) : (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
      <span className="font-medium">${product.price.toLocaleString()}</span>
      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Doble click para editar
      </span>
    </div>
  )}
</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handlePreview(product)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const q = encodeURIComponent(`${product.name} image`)
                          window.open(`https://www.google.com/search?q=${q}&tbm=isch`, '_blank')
                          handleImageModal(product)
                        }}
                        title="Buscar imagen en Google y subir"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleImageModal(product)}
                        title="Subir imagen"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number
                if (totalPages <= 7) {
                  page = i + 1
                } else if (currentPage <= 4) {
                  page = i + 1
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i
                } else {
                  page = currentPage - 3 + i
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </Button>
          </div>
        )}
      </div>

      {/* Modal de gestión de marcas */}
      <BrandsModal 
        open={isBrandsModalOpen} 
        onOpenChange={setIsBrandsModalOpen} 
      />

      {/* Modal de subida de imagen - hasta 4 imágenes */}
      {imageModalProduct && (
        <ImageMultiModal
          product={imageModalProduct}
          onClose={() => setImageModalProduct(null)}
          onSave={async (primaryUrl: string, allImages: string[]) => {
            try {
              const res = await fetch(`/api/admin/products/update-simple`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id: imageModalProduct.id, image: primaryUrl, images: allImages }),
              })
              if (!res.ok) throw new Error("Error al guardar")
              setProducts(prev => prev.map(p =>
                p.id === imageModalProduct.id ? { ...p, image: primaryUrl } : p
              ))
              setUpdatedProductId(imageModalProduct.id)
              setTimeout(() => setUpdatedProductId(null), 2000)
              toast({ title: "✅ Imágenes guardadas", description: "Las imágenes se actualizaron correctamente" })
              setImageModalProduct(null)
            } catch {
              toast({ title: "Error", description: "No se pudieron guardar las imágenes", variant: "destructive" })
            }
          }}
        />
      )}
    </PanelLayout>
  )
}
