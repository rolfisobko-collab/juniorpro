import { NextResponse, NextRequest } from "next/server"
import { getAEXConfig } from "@/lib/aex/config"
import { AEXService } from "@/lib/aex/aex.service"
import { AEXPackage } from "@/lib/aex/aex.types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, origin, destination, packages } = body

    if (!orderId || !origin || !destination || !packages) {
      return NextResponse.json({
        success: false,
        error: "Se requieren: orderId, origin, destination, packages"
      }, { status: 400 })
    }

    const config = getAEXConfig()
    const service = new AEXService(config)

    const paquetes: AEXPackage[] = packages.map((pkg: any) => ({
      descripcion: pkg.descripcion || 'Producto',
      cantidad: pkg.cantidad || 1,
      peso: pkg.peso,
      largo: pkg.largo,
      ancho: pkg.ancho,
      alto: pkg.alto,
      valor: pkg.valor || 50000,
    }))

    const serviceResult = await service.requestService(origin, destination, orderId, paquetes)

    const guia = serviceResult.datos?.[0]?.condiciones?.[0]?.guia_generada
    if (!guia) {
      throw new Error('AEX no devolvió número de guía')
    }

    const printResponse = await service.printLabel(guia, 'guia_A4')

    if (!printResponse.ok) {
      const errText = await printResponse.text()
      throw new Error(`Error imprimiendo etiqueta AEX: ${errText.substring(0, 100)}`)
    }

    const pdfBuffer = await printResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      trackingNumber: guia,
      labelUrl: `data:application/pdf;base64,${pdfBase64}`,
      labelPdf: pdfBase64,
    })

  } catch (error) {
    console.error('❌ AEX generate-label error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
