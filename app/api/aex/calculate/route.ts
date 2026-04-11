import { NextRequest, NextResponse } from "next/server"
import { getAEXConfig } from "@/lib/aex/config"
import { AEXService } from "@/lib/aex/aex.service"
import { AEXPackage } from "@/lib/aex/aex.types"

export async function POST(request: NextRequest) {
  try {
    const { datos_envio } = await request.json()

    if (!datos_envio?.origen || !datos_envio?.destino || !datos_envio?.paquetes) {
      return NextResponse.json({
        success: false,
        error: "Faltan datos requeridos: origen, destino, paquetes"
      }, { status: 400 })
    }

    const config = getAEXConfig()
    const service = new AEXService(config)

    const paquetes: AEXPackage[] = datos_envio.paquetes.map((pkg: any) => ({
      descripcion: pkg.descripcion || 'Producto',
      cantidad: pkg.cantidad || 1,
      peso: pkg.peso,
      largo: pkg.largo,
      alto: pkg.alto,
      ancho: pkg.ancho,
      valor: pkg.valor_declarado || pkg.valor || 0,
    }))

    const result = await service.calculateShipping(
      datos_envio.origen,
      datos_envio.destino,
      paquetes
    )

    const servicios = (result.datos || []).map((s: any) => ({
      id_tipo_servicio: s.id_tipo_servicio,
      tipo_servicio: s.tipo_servicio,
      descripcion: s.descripcion,
      tiempo_entrega: s.tiempo_entrega,
      incluye_pickup: s.incluye_pickup,
      incluye_envio: s.incluye_envio,
      costo_flete: s.costo_flete,
      adicionales: s.adicionales || [],
      costo_total: s.costo_flete + (s.adicionales?.reduce((sum: number, a: any) => sum + a.costo, 0) || 0),
    }))

    return NextResponse.json({
      success: true,
      data: {
        origen: datos_envio.origen,
        destino: datos_envio.destino,
        servicios,
        cotizacion: {
          servicio: servicios[0]?.tipo_servicio || 'AEX Express',
          costo_total: servicios[0]?.costo_total || 0,
          tiempo_entrega: servicios[0]?.tiempo_entrega || 24,
        }
      }
    })

  } catch (error) {
    console.error("❌ AEX calculate error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error interno del servidor"
    }, { status: 500 })
  }
}
