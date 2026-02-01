"use client"

import type React from "react"
import PanelLayout from "@/components/panel-layout"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Pencil, Package, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MediaGallery } from "@/components/media-gallery"
import { useRouter, useParams } from "next/navigation"

export default function EditProductPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    images: [] as string[],
    videos: [] as string[],
    // Campos de AEX - Dimensiones
    weight: "",
    length: "",
    width: "",
    height: "",
    // Campos de AEX - Tributos
    valorDeclarado: "",
    descripcionAduana: "",
    categoriaArancelaria: "",
    paisOrigen: "",
  })

  // Cargar datos del producto y categorías/marcas
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

        // Cargar producto específico
        const productRes = await fetch(`/api/admin/products/${productId}`)
        if (productRes.ok) {
          const productData = await productRes.json()
          const product = productData.product
          
          if (product) {
            setFormData({
              name: product.name,
              brand: product.brand,
              description: product.description,
              price: product.price.toString(),
              category: product.categoryKey || product.category,
              subcategory: product.subcategory || "",
              images: product.images || [product.image] || [],
              videos: product.videos || [],
              // Campos de AEX - Dimensiones
              weight: product.weight?.toString() || "",
              length: product.length?.toString() || "",
              width: product.width?.toString() || "",
              height: product.height?.toString() || "",
              // Campos de AEX - Tributos
              valorDeclarado: product.valorDeclarado?.toString() || "",
              descripcionAduana: product.descripcionAduana || "",
              categoriaArancelaria: product.categoriaArancelaria || "",
              paisOrigen: product.paisOrigen || "",
            })
          } else {
            toast({
              title: "Producto no encontrado",
              description: "No se encontró el producto solicitado",
              variant: "destructive"
            })
            router.push('/panel/products')
            return
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del producto",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [productId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.name || !formData.brand || !formData.description || !formData.price || !formData.category) {
      toast({ 
        title: "Error de validación", 
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive" 
      })
      setIsSubmitting(false)
      return
    }

    if (formData.images.length === 0) {
      toast({ 
        title: "Error de validación", 
        description: "Por favor agrega al menos una imagen",
        variant: "destructive" 
      })
      setIsSubmitting(false)
      return
    }

    const productData = {
      id: productId,
      name: formData.name,
      brand: formData.brand,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      categoryKey: formData.category,
      subcategory: formData.subcategory || null,
      image: formData.images[0] || '',
      images: formData.images,
      videos: formData.videos,
      inStock: true,
      // Campos de AEX - Dimensiones
      weight: formData.weight ? Number.parseFloat(formData.weight) : 0.5,
      length: formData.length ? Number.parseFloat(formData.length) : 20,
      width: formData.width ? Number.parseFloat(formData.width) : 15,
      height: formData.height ? Number.parseFloat(formData.height) : 10,
      // Campos de AEX - Tributos
      valorDeclarado: formData.valorDeclarado ? Number.parseFloat(formData.valorDeclarado) : null,
      descripcionAduana: formData.descripcionAduana || null,
      categoriaArancelaria: formData.categoriaArancelaria || null,
      paisOrigen: formData.paisOrigen || null,
    }

    try {
      console.log('🔄 Updating product:', productData)
      const res = await fetch(`/api/admin/products/update-simple`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Error al actualizar producto')
      }

      const updatedProduct = await res.json()
      console.log('✅ Product updated:', updatedProduct)
      
      toast({ 
        title: "Producto actualizado", 
        description: "Los cambios se han guardado correctamente" 
      })
      
      // Redirigir a la lista de productos
      router.push('/panel/products')
      
    } catch (error) {
      console.error('Error saving product:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : 'No se pudo guardar el producto',
        variant: "destructive" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PanelLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </PanelLayout>
    )
  }

  return (
    <PanelLayout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-full">
        <div className="p-8 pb-20">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/panel/products')}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Pencil className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Editar Producto
                </h1>
                <p className="text-slate-600 mt-1">Actualiza la información del producto</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
            {/* Información Básica */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-slate-200/60">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Información Básica
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name" className="text-base font-medium text-slate-700">Nombre del Producto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: iPhone 15 Pro, MacBook Air M2"
                      required
                      className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="brand" className="text-sm font-medium text-slate-700">Marca</Label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) => setFormData({ ...formData, brand: value })}
                      >
                        <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="price" className="text-sm font-medium text-slate-700">Precio</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="category" className="text-sm font-medium text-slate-700">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.key} value={cat.key}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.category && (
                    <div className="grid gap-3">
                      <Label htmlFor="subcategory" className="text-sm font-medium text-slate-700">Subcategoría</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                      >
                        <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Seleccionar subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .find((cat) => cat.key === formData.category)
                            ?.subcategories.map((sub: any) => (
                              <SelectItem key={sub.id} value={sub.slug}>
                                {sub.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Label htmlFor="description" className="text-sm font-medium text-slate-700">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensiones para Envío (AEX) */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200/60">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Dimensiones para Envío (AEX)
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="weight" className="text-sm font-medium text-slate-700">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="0.5"
                      className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="length" className="text-sm font-medium text-slate-700">Largo (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      placeholder="20"
                      className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="width" className="text-sm font-medium text-slate-700">Ancho (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      placeholder="15"
                      className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="height" className="text-sm font-medium text-slate-700">Alto (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="10"
                      className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tributos y Aduanas (AEX) */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-slate-200/60">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Tributos y Aduanas (AEX)
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="valorDeclarado" className="text-sm font-medium text-slate-700">Valor Declarado (USD)</Label>
                      <Input
                        id="valorDeclarado"
                        type="number"
                        step="0.01"
                        value={formData.valorDeclarado}
                        onChange={(e) => setFormData({ ...formData, valorDeclarado: e.target.value })}
                        placeholder="189.00"
                        className="h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500/20"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="paisOrigen" className="text-sm font-medium text-slate-700">País de Origen</Label>
                      <Select
                        value={formData.paisOrigen}
                        onValueChange={(value) => setFormData({ ...formData, paisOrigen: value })}
                      >
                        <SelectTrigger className="h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500/20">
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="China">China</SelectItem>
                          <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                          <SelectItem value="Japón">Japón</SelectItem>
                          <SelectItem value="Corea del Sur">Corea del Sur</SelectItem>
                          <SelectItem value="Alemania">Alemania</SelectItem>
                          <SelectItem value="Brasil">Brasil</SelectItem>
                          <SelectItem value="Argentina">Argentina</SelectItem>
                          <SelectItem value="Importado">Importado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="categoriaArancelaria" className="text-sm font-medium text-slate-700">Categoría Arancelaria (HS Code)</Label>
                    <Select
                      value={formData.categoriaArancelaria}
                      onValueChange={(value) => setFormData({ ...formData, categoriaArancelaria: value })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500/20">
                        <SelectValue placeholder="Seleccionar categoría arancelaria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3303.00.00">3303.00.00 - Perfumes y aguas de tocador</SelectItem>
                        <SelectItem value="3304.10.00">3304.10.00 - Productos de maquillaje para labios</SelectItem>
                        <SelectItem value="3304.20.00">3304.20.00 - Productos de maquillaje para ojos</SelectItem>
                        <SelectItem value="3304.99.00">3304.99.00 - Belleza y maquillaje otros</SelectItem>
                        <SelectItem value="3305.10.00">3305.10.00 - Champúes</SelectItem>
                        <SelectItem value="3305.20.00">3305.20.00 - Preparaciones para el cabello</SelectItem>
                        <SelectItem value="3306.10.00">3306.10.00 - Dentífricos</SelectItem>
                        <SelectItem value="3307.41.00">3307.41.00 - Agua de colonia</SelectItem>
                        <SelectItem value="3307.49.00">3307.49.00 - Perfumes otros</SelectItem>
                        <SelectItem value="8517.12.00">8517.12.00 - Teléfonos móviles</SelectItem>
                        <SelectItem value="8517.13.00">8517.13.00 - Teléfonos inalámbricos</SelectItem>
                        <SelectItem value="8471.30.00">8471.30.00 - Laptops portátiles</SelectItem>
                        <SelectItem value="8471.41.00">8471.41.00 - Mainframes</SelectItem>
                        <SelectItem value="8471.50.00">8471.50.00 - Unidades de proceso</SelectItem>
                        <SelectItem value="8471.60.00">8471.60.00 - Entrada/salida</SelectItem>
                        <SelectItem value="8471.70.00">8471.70.00 - Unidades de almacenamiento</SelectItem>
                        <SelectItem value="8504.40.00">8504.40.00 - Cargadores de batería</SelectItem>
                        <SelectItem value="8504.50.00">8504.50.00 - Convertidores eléctricos</SelectItem>
                        <SelectItem value="8506.50.00">8506.50.00 - Baterías de litio</SelectItem>
                        <SelectItem value="8507.60.00">8507.60.00 - Baterías de ion litio</SelectItem>
                        <SelectItem value="8518.21.00">8518.21.00 - Altavoces de una sola caja</SelectItem>
                        <SelectItem value="8518.22.00">8518.22.00 - Altavoces múltiples</SelectItem>
                        <SelectItem value="8518.30.00">8518.30.00 - Auriculares y cascos</SelectItem>
                        <SelectItem value="8518.40.00">8518.40.00 - Amplificadores eléctricos</SelectItem>
                        <SelectItem value="8519.81.00">8519.81.00 - Reproductores de CD</SelectItem>
                        <SelectItem value="8521.10.00">8521.10.00 - Videocámaras</SelectItem>
                        <SelectItem value="8521.90.00">8521.90.00 - Cámaras digitales</SelectItem>
                        <SelectItem value="8528.41.00">8528.41.00 - Monitores de computadora</SelectItem>
                        <SelectItem value="8528.51.00">8528.51.00 - Televisores de color</SelectItem>
                        <SelectItem value="8528.61.00">8528.61.00 - Proyectores de video</SelectItem>
                        <SelectItem value="8542.31.00">8542.31.00 - Procesadores y controladores</SelectItem>
                        <SelectItem value="8542.32.00">8542.32.00 - Memorias</SelectItem>
                        <SelectItem value="8542.33.00">8542.33.00 - Amplificadores</SelectItem>
                        <SelectItem value="8542.39.00">8542.39.00 - Circuitos integrados otros</SelectItem>
                        <SelectItem value="9003.19.00">9003.19.00 - Faros delanteros</SelectItem>
                        <SelectItem value="9003.20.00">9003.20.00 - Faros traseros</SelectItem>
                        <SelectItem value="9013.10.00">9013.10.00 - Pantallas de cristal líquido</SelectItem>
                        <SelectItem value="9013.20.00">9013.20.00 - Diodos emisores de luz (LED)</SelectItem>
                        <SelectItem value="9504.50.00">9504.50.00 - Consolas de videojuegos</SelectItem>
                        <SelectItem value="6111.20.00">6111.20.00 - Ropa de deporte</SelectItem>
                        <SelectItem value="6112.11.00">6112.11.00 - Trajes de baño masculinos</SelectItem>
                        <SelectItem value="6112.12.00">6112.12.00 - Trajes de baño femeninos</SelectItem>
                        <SelectItem value="6203.32.00">6203.32.00 - Pantalones masculinos</SelectItem>
                        <SelectItem value="6203.33.00">6203.33.00 - Pantalones femeninos</SelectItem>
                        <SelectItem value="6204.62.00">6204.62.00 - Chaquetas masculinas</SelectItem>
                        <SelectItem value="6204.63.00">6204.63.00 - Chaquetas femeninas</SelectItem>
                        <SelectItem value="6205.20.00">6205.20.00 - Camisas masculinas</SelectItem>
                        <SelectItem value="6206.30.00">6206.30.00 - Blusas femeninas</SelectItem>
                        <SelectItem value="6403.40.00">6403.40.00 - Calzado deportivo</SelectItem>
                        <SelectItem value="6403.51.00">6403.51.00 - Calzado con suela de caucho</SelectItem>
                        <SelectItem value="4202.11.00">4202.11.00 - Maletas y valijas</SelectItem>
                        <SelectItem value="4202.21.00">4202.21.00 - Bolsos de mano</SelectItem>
                        <SelectItem value="4202.22.00">4202.22.00 - Carteras</SelectItem>
                        <SelectItem value="4202.32.00">4202.32.00 - Mochilas</SelectItem>
                        <SelectItem value="4203.10.00">4203.10.00 - Prendas de vestir de cuero</SelectItem>
                        <SelectItem value="4203.21.00">4203.21.00 - Guantes de cuero</SelectItem>
                        <SelectItem value="7102.31.00">7102.31.00 - Diamantes</SelectItem>
                        <SelectItem value="7103.91.00">7103.91.00 - Piedras preciosas</SelectItem>
                        <SelectItem value="7104.20.00">7104.20.00 - Piedras semipreciosas</SelectItem>
                        <SelectItem value="7105.10.00">7105.10.00 - Plata</SelectItem>
                        <SelectItem value="7106.10.00">7106.10.00 - Oro</SelectItem>
                        <SelectItem value="7113.11.00">7113.11.00 - Joyería de plata</SelectItem>
                        <SelectItem value="7113.19.00">7113.19.00 - Otra joyería</SelectItem>
                        <SelectItem value="7113.20.00">7113.20.00 - Bisutería</SelectItem>
                        <SelectItem value="8415.10.00">8415.10.00 - Acondicionadores de aire</SelectItem>
                        <SelectItem value="8421.21.00">8421.21.00 - Lavadoras de ropa</SelectItem>
                        <SelectItem value="8421.22.00">8421.22.00 - Secadoras de ropa</SelectItem>
                        <SelectItem value="8421.31.00">8421.31.00 - Lavavajillas</SelectItem>
                        <SelectItem value="8422.11.00">8422.11.00 - Refrigeradores</SelectItem>
                        <SelectItem value="8422.12.00">8422.12.00 - Congeladores</SelectItem>
                        <SelectItem value="8450.11.00">8450.11.00 - Lavadoras automáticas</SelectItem>
                        <SelectItem value="8450.20.00">8450.20.00 - Secadoras</SelectItem>
                        <SelectItem value="8501.10.00">8501.10.00 - Motores eléctricos</SelectItem>
                        <SelectItem value="8501.20.00">8501.20.00 - Generadores eléctricos</SelectItem>
                        <SelectItem value="8501.31.00">8501.31.00 - Grupos electrógenos</SelectItem>
                        <SelectItem value="8504.10.00">8504.10.00 - Transformadores</SelectItem>
                        <SelectItem value="8504.21.00">8504.21.00 - Convertidores estáticos</SelectItem>
                        <SelectItem value="8514.10.00">8514.10.00 - Hornos eléctricos</SelectItem>
                        <SelectItem value="8515.11.00">8515.11.00 - Máquinas de soldar</SelectItem>
                        <SelectItem value="8516.10.00">8516.10.00 - Calentadores eléctricos</SelectItem>
                        <SelectItem value="8516.31.00">8516.31.00 - Calentadores de agua</SelectItem>
                        <SelectItem value="8517.11.00">8517.11.00 - Teléfonos con cable</SelectItem>
                        <SelectItem value="8518.10.00">8518.10.00 - Micrófonos</SelectItem>
                        <SelectItem value="8519.89.00">8519.89.00 - Otros reproductores</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                      💡 <span className="font-medium">HS Codes AEX:</span> Códigos arancelarios estándar para declaraciones de aduana
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="descripcionAduana" className="text-sm font-medium text-slate-700">Descripción para Aduana</Label>
                    <Textarea
                      id="descripcionAduana"
                      value={formData.descripcionAduana}
                      onChange={(e) => setFormData({ ...formData, descripcionAduana: e.target.value })}
                      placeholder="Descripción detallada para documentos de aduana"
                      rows={2}
                      className="border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Imágenes y Videos */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200/60">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Imágenes y Videos
                </h2>
              </div>
              <div className="p-6">
                <MediaGallery
                  images={formData.images}
                  videos={formData.videos}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  onVideosChange={(videos) => setFormData({ ...formData, videos })}
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-4 pt-8 border-t border-slate-200/60">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/panel/products')}
                disabled={isSubmitting}
                className="h-12 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Actualizando Producto...
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Actualizar Producto
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PanelLayout>
  )
}
