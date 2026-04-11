/**
 * Configuración de AEX Paraguay
 * Maneja variables de entorno y configuración por defecto
 */

import { AEXConfig } from './aex.types'

/**
 * Obtiene la configuración de AEX desde variables de entorno
 */
export function getAEXConfig(): AEXConfig {
  const sandbox = process.env.AEX_SANDBOX !== 'false'
  const clavePublica = process.env.AEX_CLAVE_PUBLICA
  const clavePrivada = process.env.AEX_CLAVE_PRIVADA
  const codigoSesion = process.env.AEX_CODIGO_SESION || '12345'

  if (!clavePublica || !clavePrivada) {
    throw new Error('Faltan variables de entorno de AEX: AEX_CLAVE_PUBLICA, AEX_CLAVE_PRIVADA')
  }

  return {
    sandbox,
    clave_publica: clavePublica,
    clave_privada: clavePrivada,
    codigo_sesion: codigoSesion,
    base_url: sandbox
      ? 'https://sandbox.aex.com.py/api/v1'
      : 'https://aex.com.py/api/v1',
  }
}

/**
 * Variables de entorno requeridas
 */
export const AEX_ENV_VARS = {
  AEX_CLAVE_PUBLICA: 'Clave pública de AEX',
  AEX_CLAVE_PRIVADA: 'Clave privada de AEX',
  AEX_CODIGO_SESION: 'Código de sesión de AEX',
  AEX_SANDBOX: 'Usar sandbox (true/false)',
} as const

/**
 * Verifica que todas las variables de entorno estén configuradas
 */
export function validateAEXEnvironment(): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  Object.entries(AEX_ENV_VARS).forEach(([key, description]) => {
    if (!process.env[key]) {
      missing.push(`${key}: ${description}`)
    }
  })

  return {
    valid: missing.length === 0,
    missing,
  }
}
