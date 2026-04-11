import { NextResponse } from "next/server"
import crypto from "crypto"

// Configuración de Bancard (valores de ejemplo - necesitarás credenciales reales)
const BANCARD_PUBLIC_KEY = process.env.BANCARD_PUBLIC_KEY
const BANCARD_PRIVATE_KEY = process.env.BANCARD_PRIVATE_KEY
const BANCARD_SANDBOX = process.env.BANCARD_SANDBOX !== "false"

const BANCARD_BASE_URL = BANCARD_SANDBOX
  ? "https://vpos.infonet.com.py"
  : "https://vpos.infonet.com.py"

export async function POST(request: Request) {
  try {
    if (!BANCARD_PUBLIC_KEY || !BANCARD_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: "Credenciales de Bancard no configuradas"
      }, { status: 500 })
    }

    const { amount, currency = "PYG", description } = await request.json()
    const shop_process_id = Date.now()

    if (!amount) {
      return NextResponse.json({
        success: false,
        error: "Se requiere amount"
      }, { status: 400 })
    }

    const token = crypto
      .createHash('md5')
      .update(`${BANCARD_PRIVATE_KEY}${shop_process_id}${amount}${currency}`)
      .digest('hex')

    console.log('🔐 Generando process_id Bancard:', {
      url: `${BANCARD_BASE_URL}/vpos/api/0.3/single_buy`,
      shop_process_id,
      amount,
      currency,
      token: token.substring(0, 10) + '...'
    })

    const requestBody = {
      public_key: BANCARD_PUBLIC_KEY as string,
      operation: {
        token: token,
        shop_process_id: shop_process_id,
        amount: amount,
        currency: currency,
        additional_data: description || "Compra TechZone",
        description: description || "Compra en TechZone"
      }
    }

    const response = await fetch(`${BANCARD_BASE_URL}/vpos/api/0.3/single_buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    console.log('📡 Respuesta cruda Bancard:', responseText.substring(0, 200))

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Error parseando JSON Bancard:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Error en respuesta de Bancard: ' + responseText.substring(0, 100)
      }, { status: 500 })
    }

    if (data.status !== "success") {
      throw new Error('Error en Bancard: ' + (data.messages || 'Error desconocido'))
    }

    console.log('✅ Process_id generado:', data.process_id)

    return NextResponse.json({
      success: true,
      process_id: data.process_id,
      shop_process_id: shop_process_id,
      amount: amount,
      currency: currency
    })

  } catch (error) {
    console.error('Error generando process_id Bancard:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
