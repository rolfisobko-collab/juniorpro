import { NextResponse, NextRequest } from "next/server"
import { getAEXConfig } from "@/lib/aex/config"
import crypto from "crypto"

// Función para generar token de autorización
async function generateAEXToken() {
  const config = getAEXConfig()

  // Generar hash de la clave privada
  const clavePrivadaHash = crypto
    .createHash('md5')
    .update(config.clave_privada + config.codigo_sesion)
    .digest('hex')

  console.log('🔐 Generando token AEX para etiqueta:', {
    url: `${config.base_url}/autorizacion-acceso/generar`,
    clave_publica: config.clave_publica,
    clave_privada_hash: clavePrivadaHash,
    codigo_sesion: config.codigo_sesion
  })

  try {
    const response = await fetch(`${config.base_url}/autorizacion-acceso/generar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clave_publica: config.clave_publica,
        clave_privada: clavePrivadaHash,
        codigo_sesion: config.codigo_sesion
      })
    })

    const data = await response.json()
    console.log('📡 Respuesta autorización AEX:', data)
    
    if (data.codigo !== 0) {
      throw new Error('Error en autorización AEX: ' + data.mensaje)
    }

    return data.codigo_autorizacion
  } catch (error) {
    console.error('Error generando token AEX:', error)
    throw error
  }
}

// Función para generar etiqueta de envío usando el método correcto de AEX
async function generateAEXLabel(token: string, orderId: string, origin: string, destination: string, packages: any[]) {
  const config = getAEXConfig()
  
  try {
    // Primero necesitamos generar una solicitud de servicio para obtener un número de guía
    console.log('📦 Generando solicitud de servicio para etiqueta...')
    
    // Mapear nombres de ciudades a códigos AEX
    const cityCodeMap: { [key: string]: string } = {
      "Asunción": "PY1101",
      "Asuncion": "PY1101",
      "Ciudad del Este": "PY1001",
      "CDE": "PY1001",
      "Encarnación": "PY1005",
      "Concepción": "PY1301",
      "San Lorenzo": "PY1102",
      "Luque": "PY1103",
      "Lambaré": "PY1104",
      "Capiatá": "PY1204",
      "Villarrica": "PY1110",
      "Caaguazú": "PY1401",
      "Coronel Oviedo": "PY1306",
      "Pedro Juan Caballero": "PY1305"
    }

    const getCityCode = (cityString: string) => {
      const cityName = cityString.split(',')[0].trim()
      const code = cityCodeMap[cityName]
      if (!code) {
        console.log(`⚠️ Ciudad no encontrada: "${cityName}", usando Asunción por defecto`)
        return "PY1101"
      }
      return code
    }

    const destinationCode = getCityCode(destination)
    const originCode = "PY1001" // Ciudad del Este por defecto

    // Preparar paquetes para AEX
    const aexPackages = packages.map((pkg: any) => ({
      descripcion: pkg.descripcion || 'Producto',
      peso: pkg.peso,
      largo: pkg.largo,
      ancho: pkg.ancho,
      alto: pkg.alto,
      valor: pkg.valor || 50000,
      codigo_externo: `${orderId}-pkg-${Math.random().toString(36).substr(2, 9)}`
    }))

    // Generar solicitud de servicio
    const serviceRequest = {
      clave_publica: config.clave_publica,
      codigo_autorizacion: token,
      origen: originCode,
      destino: destinationCode,
      codigo_operacion: orderId,
      paquetes: aexPackages,
      codigo_tipo_carga: 'P'
    }

    const serviceResponse = await fetch(`${config.base_url}/envios/solicitar_servicio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceRequest)
    })

    const serviceData = await serviceResponse.json()
    
    if (serviceData.codigo !== 0) {
      throw new Error('Error en solicitud de servicio AEX: ' + serviceData.mensaje)
    }

    // Obtener el número de guía de la respuesta
    const guiaNumero = serviceData.datos[0]?.condiciones[0]?.guia_generada || `${orderId}-${Date.now()}`

    console.log('� Generando etiqueta PDF para guía:', guiaNumero)

    // Ahora usar el método de impresión con el número de guía
    const printRequest = {
      clave_publica: config.clave_publica,
      codigo_autorizacion: token,
      guia: guiaNumero,
      formato: "guia_A4", // Formato estándar A4
      imprimir_partida: false // No imprimir por partida
    }

    console.log('🖨️ Solicitando impresión de etiqueta:', printRequest)

    const printResponse = await fetch(`${config.base_url}/envios/imprimir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(printRequest)
    })

    console.log('📡 Status respuesta impresión:', printResponse.status, printResponse.statusText)

    // La API de impresión devuelve directamente un PDF, no JSON
    if (printResponse.ok) {
      const pdfBuffer = await printResponse.arrayBuffer()
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
      
      return {
        success: true,
        labelPdf: pdfBase64,
        trackingNumber: guiaNumero,
        labelUrl: `data:application/pdf;base64,${pdfBase64}`
      }
    } else {
      const errorText = await printResponse.text()
      throw new Error('Error en impresión de etiqueta AEX: ' + errorText)
    }

  } catch (error) {
    console.error('Error generando etiqueta AEX:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  let orderId = null
  
  try {
    const body = await request.json()
    orderId = body.orderId
    const { origin, destination, packages, recipient } = body

    if (!orderId || !origin || !destination || !packages) {
      return NextResponse.json({
        success: false,
        error: "Se requieren: orderId, origin, destination, packages"
      }, { status: 400 })
    }

    // Generar token de autorización
    const token = await generateAEXToken()

    // Generar etiqueta
    const labelResponse = await generateAEXLabel(token, orderId, origin, destination, packages)

    // Transformar la respuesta
    const labelData = {
      success: true,
      labelUrl: labelResponse.labelUrl,
      trackingNumber: labelResponse.trackingNumber,
      labelPdf: labelResponse.labelPdf,
      labelData: labelResponse
    }

    console.log('✅ Etiqueta AEX generada:', labelData)

    return NextResponse.json(labelData)

  } catch (error) {
    console.error('Error generando etiqueta AEX:', error)
    
    // Para desarrollo, devolver una etiqueta de ejemplo
    if (process.env.NODE_ENV === 'development') {
      const exampleOrderId = orderId || "EXAMPLE_ORDER"
      console.log('🔧 Usando etiqueta de ejemplo para desarrollo')
      return NextResponse.json({
        success: true,
        labelUrl: "https://via.placeholder.com/400x200.png?text=ETIQUETA+AEX+" + exampleOrderId,
        trackingNumber: "AEX" + exampleOrderId,
        qrCode: "QR_CODE_EXAMPLE",
        sandbox: true,
        labelData: {
          url_etiqueta: "https://via.placeholder.com/400x200.png?text=ETIQUETA+AEX+" + exampleOrderId,
          numero_seguimiento: "AEX" + exampleOrderId,
          codigo_qr: "QR_CODE_EXAMPLE"
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
