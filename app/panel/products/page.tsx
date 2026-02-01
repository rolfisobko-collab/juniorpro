"use client"

import type React from "react"
import PanelLayout from "@/components/panel-layout"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, Building, Eye, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BrandsModal } from "@/components/brands-modal"
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

  const handleDelete = async (id: string) => {
    try {
      console.log('🗑️ Deleting product:', id)
      
      const res = await fetch(`/api/admin/products/delete-simple`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }), // Enviar el ID en el body
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('❌ Delete error:', errorData)
        toast({ 
          title: "Error al eliminar", 
          description: errorData.error || "No se pudo eliminar el producto",
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
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell>${product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {product.inStock ? "En Stock" : "Agotado"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(product)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de gestión de marcas */}
      <BrandsModal 
        open={isBrandsModalOpen} 
        onOpenChange={setIsBrandsModalOpen} 
      />

      {/* Diálogo de previsualización de productos */}
      {showPreviewDialog && extractedProducts.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Previsualización de Productos ({extractedProducts.length})</h2>
            <p className="text-muted-foreground mb-4">
              Revisa los productos que se importarán desde el archivo HTML del ERP
            </p>
            
            <div className="mb-4 max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white border-b">
                  <tr>
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Precio</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Marca</th>
                    <th className="text-left p-2">Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedProducts.map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{product.codigo}</td>
                      <td className="p-2 max-w-xs truncate" title={product.descripcion}>
                        {product.descripcion}
                      </td>
                      <td className="p-2 text-right font-mono">
                        ${product.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2 text-center">{product.stock}</td>
                      <td className="p-2">{product.brand}</td>
                      <td className="p-2">{product.categoryKey}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPreviewDialog(false)
                  setExtractedProducts([])
                }}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmPreviewImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importando...' : `Importar ${extractedProducts.length} productos`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de duplicados */}
      {showConfirmDialog && pendingImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Confirmar Actualización de Productos</h2>
            <p className="text-muted-foreground mb-4">
              Se encontraron {pendingImport.result.duplicates.length} productos con códigos duplicados. 
              ¿Desea actualizar los productos existentes con los nuevos datos?
            </p>
            
            <div className="space-y-3 mb-6">
              {pendingImport.result.duplicates.map((dup: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">Código: {dup.codigo}</p>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Actual:</p>
                          <p className="font-medium">{dup.existing.name}</p>
                          <p>Stock: {dup.existing.stock} | Marca: {dup.existing.brand}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nuevo:</p>
                          <p className="font-medium">{dup.new.name}</p>
                          <p>Stock: {dup.new.stock} | Marca: {dup.new.brand}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowConfirmDialog(false)
                  setPendingImport(null)
                }}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmImport}
                disabled={isImporting}
              >
                {isImporting ? 'Actualizando...' : 'Confirmar Actualización'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  )
}
