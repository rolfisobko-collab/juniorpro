/**
 * Cliente HTTP para la API de AEX Paraguay
 * AEX autentica por body (clave_publica + codigo_autorizacion), NO por header.
 */

import { AEXConfig } from './aex.types'

export class AEXClient {
  private config: AEXConfig

  constructor(config: AEXConfig) {
    this.config = config
  }

  /**
   * POST a un endpoint de AEX con autenticación en el body.
   * El body base siempre incluye clave_publica + codigo_autorizacion.
   */
  async post<T = any>(
    endpoint: string,
    token: string,
    body: Record<string, any>
  ): Promise<T> {
    const url = `${this.config.base_url}${endpoint}`
    const fullBody = {
      clave_publica: this.config.clave_publica,
      codigo_autorizacion: token,
      ...body,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullBody),
    })

    const text = await response.text()
    let data: T
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`AEX ${endpoint} devolvió respuesta no-JSON: ${text.substring(0, 100)}`)
    }

    return data
  }
}

export function createAEXClient(config: AEXConfig): AEXClient {
  if (!config.clave_publica || !config.clave_privada || !config.base_url) {
    throw new Error('Configuración de AEX inválida')
  }
  return new AEXClient(config)
}
