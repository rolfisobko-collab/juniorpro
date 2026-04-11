/**
 * Autenticación con la API real de AEX Paraguay
 * POST /autorizacion-acceso/generar
 * Respuesta: { codigo: 0, mensaje: "OK", codigo_autorizacion: "..." }
 * El token dura 10 minutos.
 */

import crypto from 'crypto'
import { AEXConfig, AEXAuthResponse, AEXTokenCache } from './aex.types'
import { tokenCache } from './token-cache'

export class AEXAuthManager {
  private config: AEXConfig

  constructor(config: AEXConfig) {
    this.config = config
  }

  private generatePrivateKeyHash(): string {
    return crypto
      .createHash('md5')
      .update(this.config.clave_privada + this.config.codigo_sesion)
      .digest('hex')
  }

  async authenticate(): Promise<string> {
    const clavePrivadaHash = this.generatePrivateKeyHash()

    const body = {
      clave_publica: this.config.clave_publica,
      clave_privada: clavePrivadaHash,
      codigo_sesion: this.config.codigo_sesion,
    }

    console.log('� Autenticando con AEX:', {
      url: `${this.config.base_url}/autorizacion-acceso/generar`,
      clave_publica: body.clave_publica.substring(0, 8) + '...',
      codigo_sesion: body.codigo_sesion,
    })

    const response = await fetch(`${this.config.base_url}/autorizacion-acceso/generar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    let data: AEXAuthResponse
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`AEX auth devolvió respuesta no-JSON: ${text.substring(0, 100)}`)
    }

    if (data.codigo !== 0 || !data.codigo_autorizacion) {
      throw new Error(`Error auth AEX (codigo ${data.codigo}): ${data.mensaje}`)
    }

    console.log('✅ Token AEX obtenido')
    tokenCache.set(data.codigo_autorizacion, 9) // 9 min (1 min de margen sobre los 10 reales)
    return data.codigo_autorizacion
  }

  async getValidToken(): Promise<string> {
    const cached = await tokenCache.get()
    if (cached) {
      const minsLeft = Math.floor((cached.expires_at.getTime() - Date.now()) / 60000)
      console.log(`✅ Token AEX cacheado (${minsLeft} min restantes)`)
      return cached.token
    }
    return this.authenticate()
  }

  async refreshToken(): Promise<string> {
    await tokenCache.clear()
    return this.authenticate()
  }

  async getTokenInfo(): Promise<AEXTokenCache | null> {
    return tokenCache.get()
  }

  async clearTokenCache(): Promise<void> {
    await tokenCache.clear()
  }

  async hasValidToken(): Promise<boolean> {
    const info = tokenCache.getInfo()
    return info.hasToken && !info.isExpired
  }
}

export function createAEXAuthManager(config: AEXConfig): AEXAuthManager {
  return new AEXAuthManager(config)
}
