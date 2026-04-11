/**
 * Servicio principal de AEX Paraguay
 * Usa AEXAuthManager + AEXClient con endpoints y tipos reales.
 */

import {
  AEXConfig,
  AEXPackage,
  AEXCalculateResponse,
  AEXRequestServiceResponse,
  AEXConfirmServiceBody,
  AEXConfirmServiceResponse,
  AEXTrackingResponse,
  AEXCityResponse,
} from './aex.types'
import { AEXAuthManager } from './aex.auth'
import { AEXClient } from './aex.client'

export class AEXService {
  private auth: AEXAuthManager
  private client: AEXClient
  private config: AEXConfig

  constructor(config: AEXConfig) {
    this.config = config
    this.auth = new AEXAuthManager(config)
    this.client = new AEXClient(config)
  }

  private async getToken(): Promise<string> {
    return this.auth.getValidToken()
  }

  async getCities(origen?: string): Promise<AEXCityResponse> {
    const token = await this.getToken()
    return this.client.post<AEXCityResponse>('/envios/ciudades', token, origen ? { origen } : {})
  }

  async calculateShipping(
    origen: string,
    destino: string,
    paquetes: AEXPackage[]
  ): Promise<AEXCalculateResponse> {
    const token = await this.getToken()
    console.log('📦 AEX calcular envío:', { origen, destino, paquetes: paquetes.length })
    const result = await this.client.post<AEXCalculateResponse>('/envios/calcular', token, {
      origen,
      destino,
      paquetes,
    })
    if (result.codigo !== 0) {
      throw new Error(`AEX calcular error (${result.codigo}): ${result.mensaje}`)
    }
    return result
  }

  async requestService(
    origen: string,
    destino: string,
    codigoOperacion: string,
    paquetes: AEXPackage[]
  ): Promise<AEXRequestServiceResponse> {
    const token = await this.getToken()
    const result = await this.client.post<AEXRequestServiceResponse>('/envios/solicitar_servicio', token, {
      origen,
      destino,
      codigo_operacion: codigoOperacion,
      paquetes,
    })
    if (result.codigo !== 0) {
      throw new Error(`AEX solicitar_servicio error (${result.codigo}): ${result.mensaje}`)
    }
    return result
  }

  async confirmService(body: Omit<AEXConfirmServiceBody, 'clave_publica' | 'codigo_autorizacion'>): Promise<AEXConfirmServiceResponse> {
    const token = await this.getToken()
    const result = await this.client.post<AEXConfirmServiceResponse>('/envios/confirmar_servicio', token, body)
    if (result.codigo !== 0) {
      throw new Error(`AEX confirmar_servicio error (${result.codigo}): ${result.mensaje}`)
    }
    return result
  }

  async getTracking(numeroGuia?: string, codigoOperacion?: string): Promise<AEXTrackingResponse> {
    const token = await this.getToken()
    const body: Record<string, string> = {}
    if (numeroGuia) body.numero_guia = numeroGuia
    if (codigoOperacion) body.codigo_operacion = codigoOperacion
    return this.client.post<AEXTrackingResponse>('/envios/tracking', token, body)
  }

  async printLabel(guia: string, formato: string = 'guia_A4'): Promise<Response> {
    const token = await this.auth.getValidToken()
    const url = `${this.config.base_url}/envios/imprimir`
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clave_publica: this.config.clave_publica,
        codigo_autorizacion: token,
        guia,
        formato,
        imprimir_partida: false,
      }),
    })
  }

  async hasValidToken(): Promise<boolean> {
    return this.auth.hasValidToken()
  }

  async clearTokenCache(): Promise<void> {
    return this.auth.clearTokenCache()
  }
}

export function createAEXService(config: AEXConfig): AEXService {
  return new AEXService(config)
}
