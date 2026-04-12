import { useState } from "react"
import { selectBox, BoxStandard, CartItemDimensions } from "@/lib/box-selector"

interface AEXShippingRequest {
  products: Array<{
    id: string
    name: string
    weight: number
    length: number
    width: number
    height: number
    valorDeclarado?: number
    descripcionAduana?: string
    categoriaArancelaria?: string
    paisOrigen?: string
    quantity: number
  }>
  destination: {
    city: string
    department: string
    address: string
  }
  origin?: {
    city: string
    department: string
    address: string
  }
}

interface AEXShippingResponse {
  success: boolean
  shipping_cost?: number
  delivery_time?: string
  services?: Array<{
    name: string
    cost: number
    estimated_days: string
  }>
  error?: string
}

export function useAEXShipping() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingOptions, setShippingOptions] = useState<AEXShippingResponse['services']>([])

  const calculateShipping = async (request: AEXShippingRequest): Promise<AEXShippingResponse> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🚚 Calculando envío AEX:', request)

      // Cargar cajas estándar y seleccionar la óptima
      let selectedBoxName: string | null = null
      let paquetes: any[]

      try {
        const boxesRes = await fetch('/api/admin/boxes')
        const boxes: BoxStandard[] = await boxesRes.json()

        const cartItems: CartItemDimensions[] = request.products.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          weightKg: p.weight,
          lengthCm: p.length,
          widthCm: p.width,
          heightCm: p.height,
        }))

        const selection = selectBox(cartItems, boxes)

        if (selection) {
          selectedBoxName = selection.box.name
          console.log(`📦 Caja seleccionada: ${selection.box.name} — ${selection.utilizationPct}% uso`)
          paquetes = [{
            descripcion: 'Pedido TechZone',
            cantidad: 1,
            peso: selection.totalShipmentWeightKg,
            largo: selection.box.lengthCm,
            ancho: selection.box.widthCm,
            alto: selection.box.heightCm,
            valor_declarado: request.products.reduce((sum, p) => sum + (p.valorDeclarado || 0) * p.quantity, 0),
          }]
        } else {
          console.warn('⚠️ Ninguna caja alcanza, usando dimensiones estimadas')
          const totalWeight = request.products.reduce((sum, p) => sum + p.weight * p.quantity, 0)
          paquetes = [{
            descripcion: 'Pedido TechZone',
            cantidad: 1,
            peso: totalWeight,
            largo: 60, ancho: 50, alto: 40,
            valor_declarado: request.products.reduce((sum, p) => sum + (p.valorDeclarado || 0) * p.quantity, 0),
          }]
        }
      } catch {
        console.warn('⚠️ Error cargando cajas, usando fallback')
        const totalWeight = request.products.reduce((sum, p) => sum + p.weight * p.quantity, 0)
        paquetes = [{
          descripcion: 'Pedido TechZone',
          cantidad: 1,
          peso: totalWeight,
          largo: 40, ancho: 30, alto: 20,
        }]
      }

      // Llamada a AEX
      const aexRequest = {
        datos_envio: {
          origen: request.origin?.city || "Asunción",
          destino: `${request.destination.city}, ${request.destination.department}`,
          paquetes,
        }
      }

      const response = await fetch('/api/aex/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aexRequest),
      })

      console.log('📡 Status respuesta API:', response.status, response.statusText)
      console.log('📡 Headers respuesta:', Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log('📡 Respuesta cruda API:', responseText.substring(0, 500))

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Error parseando JSON API:', parseError)
        throw new Error('La API devolvió HTML en lugar de JSON: ' + responseText.substring(0, 200))
      }

      console.log('📡 Datos parseados API:', data)

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Error HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      console.log('✅ Respuesta AEX:', data)

      // Transformar la respuesta al formato esperado
      if (data.success) {
        const transformedServices = data.tarifas ? data.tarifas.map((tarifa: any) => ({
          name: tarifa.descripcion || "Envío Estándar",
          cost: tarifa.total || 0,
          estimated_days: tarifa.plazo_entrega || "3-5 días"
        })) : []

        setShippingOptions(transformedServices)

        return {
          success: true,
          shipping_cost: data.total_envio || (transformedServices[0]?.cost || 0),
          services: transformedServices
        }
      }

      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error AEX shipping:', errorMessage)
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setError(null)
    setShippingOptions([])
  }

  return {
    calculateShipping,
    loading,
    error,
    shippingOptions,
    reset
  }
}
