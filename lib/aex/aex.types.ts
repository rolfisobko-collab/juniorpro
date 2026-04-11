/**
 * Tipos de la API de AEX Paraguay
 * Basados en la API real de AEX v1
 */

// === CONFIGURACIÓN ===
export interface AEXConfig {
  sandbox: boolean
  clave_publica: string
  clave_privada: string
  codigo_sesion: string
  base_url: string
}

// === TOKEN CACHE ===
export interface AEXTokenCache {
  token: string
  expires_at: Date
  created_at: Date
}

// === AUTENTICACIÓN ===
// Request: clave_publica, clave_privada (MD5 de privada+sesion), codigo_sesion
export interface AEXAuthRequest {
  clave_publica: string
  clave_privada: string  // MD5(clave_privada_real + codigo_sesion)
  codigo_sesion: string
}

// Response real de AEX: { codigo: 0, mensaje: "OK", codigo_autorizacion: "..." }
export interface AEXAuthResponse {
  codigo: number
  mensaje: string
  codigo_autorizacion?: string
}

// === PAQUETES ===
export interface AEXPackage {
  descripcion: string
  cantidad?: number
  peso: number        // kg
  largo: number       // cm
  alto: number        // cm
  ancho: number       // cm
  valor: number       // Gs.
}

// === CALCULAR ENVÍO ===
export interface AEXCalculateRequest {
  clave_publica: string
  codigo_autorizacion: string
  origen: string      // código ciudad AEX
  destino: string     // código ciudad AEX
  paquetes: AEXPackage[]
}

export interface AEXServiceOption {
  id_tipo_servicio: number
  tipo_servicio: string
  descripcion: string
  tiempo_entrega: number   // horas
  incluye_pickup: boolean
  incluye_envio: boolean
  costo_flete: number      // Gs.
  adicionales?: Array<{ descripcion: string; costo: number }>
}

// Response: { codigo: 0, mensaje: "OK", datos: [...] }
export interface AEXCalculateResponse {
  codigo: number
  mensaje: string
  datos?: AEXServiceOption[]
}

// === SOLICITAR SERVICIO ===
export interface AEXRequestServiceBody {
  clave_publica: string
  codigo_autorizacion: string
  origen: string
  destino: string
  codigo_operacion: string
  paquetes: AEXPackage[]
}

export interface AEXRequestServiceResponse {
  codigo: number
  mensaje: string
  datos?: Array<{
    id_tipo_servicio: number
    condiciones?: Array<{
      id_solicitud: number
      guia_generada?: string
    }>
  }>
}

// === CONFIRMAR SERVICIO ===
export interface AEXPersonData {
  nombre: string
  ruc_cedula: string
  telefono: string
  email?: string
  direccion: string
  ciudad: string        // código ciudad AEX
}

export interface AEXConfirmServiceBody {
  clave_publica: string
  codigo_autorizacion: string
  Id_solicitud: number
  id_tipo_servicio: number
  remitente: AEXPersonData
  pickup?: AEXPersonData
  destinatario: AEXPersonData
  entrega: AEXPersonData
}

export interface AEXConfirmServiceResponse {
  codigo: number
  mensaje: string
  numero_guia?: string
}

// === TRACKING ===
export interface AEXTrackingRequest {
  clave_publica: string
  codigo_autorizacion: string
  numero_guia?: string
  codigo_operacion?: string
}

export interface AEXTrackingEvent {
  fecha: string
  hora: string
  estado: string
  descripcion: string
  ubicacion?: string
}

export interface AEXTrackingResponse {
  codigo: number
  mensaje: string
  datos?: AEXTrackingEvent[]
}

// === CIUDADES ===
export interface AEXCityResponse {
  codigo: number
  mensaje: string
  datos?: Array<{ id: string; nombre: string; departamento?: string }>
}

// === WEBHOOK ===
export interface AEXWebhookPayload {
  numero_guia: string
  estado: string
  fecha_actualizacion: string
  descripcion?: string
}

// === TIPO BASE DE RESPUESTA ===
export interface AEXBaseResponse {
  codigo: number
  mensaje: string
}
