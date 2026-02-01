import { NextRequest, NextResponse } from "next/server"
import { getAEXConfig } from "@/lib/aex/config"
import crypto from 'crypto'

// Función para generar token de autorización
async function generateAEXToken() {
  const config = getAEXConfig()
  
  console.log('🔧 Configuración AEX:', {
    has_clave_publica: !!config.clave_publica,
    has_clave_privada: !!config.clave_privada,
    has_codigo_sesion: !!config.codigo_sesion,
    base_url: config.base_url
  })
  
  // Generar hash de la clave privada
  const clavePrivadaHash = crypto
    .createHash('md5')
    .update(config.clave_privada + config.codigo_sesion)
    .digest('hex')

  console.log('🔐 Generando token AEX:', {
    url: `${config.base_url}/autorizacion-acceso/generar`,
    clave_publica: config.clave_publica,
    clave_privada_hash: clavePrivadaHash.substring(0, 10) + '...', // Solo mostrar parte del hash
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

    console.log('📡 Status token AEX:', response.status, response.statusText)

    const responseText = await response.text()
    console.log('📡 Respuesta cruda token AEX:', responseText.substring(0, 200))
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Error parseando JSON token AEX:', parseError)
      throw new Error('La API de token AEX devolvió HTML: ' + responseText.substring(0, 100))
    }
    
    console.log('📡 Datos token AEX:', data)
    
    if (data.codigo !== 0) {
      throw new Error('Error en autorización AEX: ' + data.mensaje)
    }

    console.log('✅ Token AEX generado:', data.codigo_autorizacion)
    return data.codigo_autorizacion
  } catch (error) {
    console.error('❌ Error generando token AEX:', error)
    throw error
  }
}

// Función para calcular envío con API real de AEX
async function calculateRealAEXShipping(token: string, origin: string, destination: string, packages: any[]) {
  const config = getAEXConfig()
  try {
    const requestBody = {
      clave_publica: config.clave_publica,
      codigo_autorizacion: token,
      origen: origin,
      destino: destination,
      paquetes: packages,
      codigo_tipo_carga: 'P' // P = Paquete
    }

    console.log('📦 Enviando solicitud AEX:', {
      url: `${config.base_url}/envios/calcular`,
      body: requestBody
    })

    const response = await fetch(`${config.base_url}/envios/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 Status respuesta AEX:', response.status, response.statusText)
    console.log('📡 Headers respuesta AEX:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📡 Respuesta cruda AEX:', responseText.substring(0, 200))

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Error parseando JSON AEX:', parseError)
      throw new Error('La API de AEX devolvió HTML en lugar de JSON: ' + responseText.substring(0, 100))
    }
    
    if (data.codigo !== 0) {
      throw new Error('Error calculando envío AEX: ' + data.mensaje)
    }

    return data
  } catch (error) {
    console.error('Error en cálculo AEX:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { datos_envio } = await request.json()

    if (!datos_envio) {
      return NextResponse.json({
        success: false,
        error: "Se requieren datos de envío"
      }, { status: 400 })
    }

    // Validar datos requeridos
    if (!datos_envio.origen || !datos_envio.destino || !datos_envio.paquetes) {
      return NextResponse.json({
        success: false,
        error: "Faltan datos requeridos: origen, destino, paquetes"
      }, { status: 400 })
    }

    // Generar token de autorización
    const token = await generateAEXToken()

    // Mapear nombres de ciudades a códigos AEX - Ampliado con todas las ciudades del componente
    const cityCodeMap: { [key: string]: string } = {
      // Asunción y área metropolitana
      "Asunción": "PY1101",
      "Asuncion": "PY1101",
      "Lambaré": "PY1104",
      "Luque": "PY1103", 
      "San Antonio": "PY1109",
      "San Lorenzo": "PY1102",
      "Villarrica": "PY1110",
      "Ñemby": "PY1105",
      "Itauguá": "PY1106",
      "Villa Elisa": "PY1107",
      "Mariano Roque Alonso": "PY1108",
      
      // Alto Paraná
      "Ciudad del Este": "PY1001",
      "CDE": "PY1001",
      "Hernandarias": "PY1002",
      "Presidente Franco": "PY1003",
      "Puerto Iguazú": "PY1004",
      "Encarnación": "PY1005",
      "Cambyretá": "PY1006",
      
      // Central
      "Areguá": "PY1201",
      "Caacupé": "PY1202",
      "Carapeguá": "PY1203",
      "Capiatá": "PY1204",
      "Itá": "PY1205",
      "Julián Augusto Saldivar": "PY1206",
      "Limpio": "PY1207",
      "Nueva Italia": "PY1208",
      "Pirayú": "PY1209",
      "San José de los Arroyos": "PY1210",
      "San Juan Bautista": "PY1211",
      "San Pedro": "PY1212",
      "Sapucaí": "PY1213",
      "Yaguarón": "PY1214",
      "Ybycuí": "PY1215",
      "Ypané": "PY1216",
      
      // Concepción
      "Concepción": "PY1301",
      "Horqueta": "PY1302",
      "General Resquín": "PY1303",
      "Yby Pytá": "PY1304",
      "Pedro Juan Caballero": "PY1305",
      "Coronel Oviedo": "PY1306",
      "Trinidad": "PY1307",
      "Altos": "PY1308",
      "Yataity": "PY1309",
      
      // Cordillera
      "Caaguazú": "PY1401",
      "Mcal. López": "PY1402",
      "Naranjal": "PY1403",
      "Raúl Arsenio Oviedo": "PY1404",
      "San Joaquín": "PY1405",
      "San José": "PY1406",
      
      // Guairá
      "Mbocayaty": "PY1501",
      "Itanará": "PY1502",
      "Paso Yobai": "PY1503",
      "Independencia": "PY1504",
      "General Higinio Morínigo": "PY1505",
      
      // Itapúa
      "San Pedro del Ycuamandiyú": "PY1602",
      "Carmen del Paraná": "PY1603",
      "General Artigas": "PY1605",
      "Coronel Bogado": "PY1606",
      "Alborada": "PY1607",
      "Eden": "PY1608",
      "Fram": "PY1609",
      "San Cosme y Damián": "PY1610",
      "Yatay": "PY1611",
      "Bella Vista": "PY1612",
      "Capitán Miranda": "PY1613",
      
      // Misiones
      "San Ignacio": "PY1701",
      "Ayolas": "PY1702",
      "Santa María": "PY1703",
      "San Miguel": "PY1704",
      "Yabebyry": "PY1705",
      "Pilar": "PY1706",
      
      // Ñeembucú
      "Benjamín Aceval": "PY1801",
      "San Estanislao": "PY1802",
      "Alto Verá": "PY1803",
      "Guarambaré": "PY1804",
      "Humaitá": "PY1805",
      "General Elizardo Aquino": "PY1806",
      "Lima": "PY1807",
      
      // Paraguarí
      "Yhú": "PY1901",
      "Escobar": "PY1902",
      
      // Presidente Hayes
      "Tres Bocas": "PY2001",
      "Isla Pucú": "PY2002",
      "Nanawa": "PY2003",
      "Puerto Pinasco": "PY2004"
    }

    // Extraer código de ciudad del string (ej: "Asunción, Central" -> "Asunción")
    const getCityCode = (cityString: string) => {
      const cityName = cityString.split(',')[0].trim()
      const code = cityCodeMap[cityName]
      
      if (!code) {
        console.log(`⚠️ Ciudad no encontrada en cityCodeMap: "${cityName}"`)
        console.log(`📍 Ciudades disponibles: ${Object.keys(cityCodeMap).join(', ')}`)
        throw new Error(`La ciudad "${cityName}" no está disponible para envío AEX. Ciudades disponibles: ${Object.keys(cityCodeMap).slice(0, 10).join(', ')}...`)
      }
      
      return code
    }

    const originCode = getCityCode(datos_envio.origen)
    const destinationCode = getCityCode(datos_envio.destino)

    // Preparar paquetes para AEX
    const aexPackages = datos_envio.paquetes.map((pkg: any) => ({
      descripcion: pkg.descripcion || 'Producto',
      peso: pkg.peso,
      largo: pkg.largo,
      alto: pkg.alto,
      ancho: pkg.ancho,
      valor: pkg.valor_declarado || 0,
      pais_origen: pkg.pais_origen || 'Importado'
    }))

    // Calcular envío con API real
    const result = await calculateRealAEXShipping(token, originCode, destinationCode, aexPackages)

    // Formatear respuesta
    const services = result.datos.map((service: any) => ({
      id_tipo_servicio: service.id_tipo_servicio,
      tipo_servicio: service.tipo_servicio,
      descripcion: service.descripcion,
      tiempo_entrega: service.tiempo_entrega,
      incluye_pickup: service.incluye_pickup,
      incluye_envio: service.incluye_envio,
      costo_flete: service.costo_flete,
      adicionales: service.adicionales || [],
      costo_total: service.costo_flete + (service.adicionales?.reduce((sum: number, add: any) => sum + add.costo, 0) || 0)
    }))

    return NextResponse.json({
      success: true,
      data: {
        origen: datos_envio.origen,
        destino: datos_envio.destino,
        paquetes: datos_envio.paquetes,
        servicios: services,
        cotizacion: {
          servicio: services[0]?.tipo_servicio || 'AEX Express',
          costo_total: services[0]?.costo_total || 0,
          tiempo_entrega: services[0]?.tiempo_entrega || 24
        }
      }
    })

  } catch (error) {
    console.error("❌ AEX API Error:", error)
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Si el error es de ciudad no encontrada, dar mensaje específico
    if (error instanceof Error && error.message.includes('no está disponible para envío AEX')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error interno del servidor",
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
