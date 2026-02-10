"use client"

import type React from "react"
import PanelLayout from "@/components/panel-layout"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, Building, Eye, Upload, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BrandsModal } from "@/components/brands-modal"
import { ImageLinkModal } from "@/components/image-link-modal"
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
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isBrandsModalOpen, setIsBrandsModalOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [pendingImport, setPendingImport] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [extractedProducts, setExtractedProducts] = useState<any[]>([])
  const [imageModalProduct, setImageModalProduct] = useState<Product | null>(null)
  const [updatedProductId, setUpdatedProductId] = useState<string | null>(null)
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

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(`/api/admin/products?search=${encodeURIComponent(searchQuery)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })

        if (!res.ok) {
          const errorData = await res.json()
          console.error('❌ API Error:', errorData)
          toast({
            title: "Error al cargar productos",
            description: errorData.error || "Error desconocido",
            variant: "destructive"
          })
          return
        }

        const data = (await res.json()) as { products?: any[] }
        console.log('✅ Products loaded:', data.products?.length || 0)
        console.log('📂 Available categories:', categories.map(c => ({ key: c.key, name: c.name })))
        console.log('🔍 Sample product categoryKey:', data.products?.[0]?.categoryKey)
        
        const mapped = (data.products ?? []).map((p) => {
          const category = categories.find((c) => c.key === p.categoryKey)
          console.log(`🏷️ Product ${p.name}: categoryKey=${p.categoryKey}, found=${!!category}, categoryName=${category?.name}`)
          
          return {
            id: p.id,
            name: p.name,
            brand: p.brand,
            description: p.description,
            price: p.price,
            category: category?.name || p.categoryKey || 'Sin categoría', // Mapear categoryKey a category para el frontend
            image: p.image || p.images?.[0] || '', // Usar primera imagen si no hay image
            rating: p.rating || 0,
            reviews: p.reviews || 0,
            inStock: p.inStock ?? true,
          }
        }) as Product[]

        if (!cancelled) setProducts(mapped)
      } catch (error) {
        console.error('❌ Load error:', error)
        toast({
          title: "Error de conexión",
          description: "No se pudieron cargar los productos",
          variant: "destructive"
        })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        
        // Actualizar el producto en la lista local
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

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
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
                              src={product.image} 
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
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>${product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handlePreview(product)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const searchQuery = encodeURIComponent(`${product.name} image`)
                          window.open(`https://www.google.com/search?q=${searchQuery}&tbm=isch`, '_blank')
                        }}
                        title="Buscar imagen en Google"
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
      </div>

      {/* Modal de gestión de marcas */}
      <BrandsModal 
        open={isBrandsModalOpen} 
        onOpenChange={setIsBrandsModalOpen} 
      />

      {/* Modal de subida de imagen */}
      {imageModalProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Subir imagen: {imageModalProduct.name.substring(0, 30)}...
              </h3>
              <button
                onClick={() => setImageModalProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <ImageUpload 
              value={imageModalProduct.image || ""}
              onChange={handleImageUpdate}
            />
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setImageModalProduct(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  )
}
