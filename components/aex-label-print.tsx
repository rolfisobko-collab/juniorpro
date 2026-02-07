"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Printer, Download, Package, QrCode } from "lucide-react"

interface AEXLabelPrintProps {
  orderId: string
  origin: string
  destination: string
  packages: Array<{
    peso: number
    largo: number
    ancho: number
    alto: number
    descripcion?: string
  }>
  recipient?: {
    name: string
    phone: string
    email: string
  }
  onGenerated?: (labelData: any) => void
}

export default function AEXLabelPrint({ 
  orderId, 
  origin, 
  destination, 
  packages, 
  recipient,
  onGenerated 
}: AEXLabelPrintProps) {
  const [loading, setLoading] = useState(false)
  const [labelData, setLabelData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const generateLabel = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/aex/generate-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          origin,
          destination,
          packages,
          recipient
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setLabelData(data)
        if (onGenerated) {
          onGenerated(data)
        }
      } else {
        throw new Error(data.error || 'Error generando etiqueta')
      }
    } catch (err) {
      console.error('Error generando etiqueta:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const printLabel = () => {
    if (labelData?.labelUrl) {
      if (labelData.labelUrl.startsWith('data:application/pdf')) {
        // Es un PDF base64, crear un blob y abrir en nueva ventana
        const base64Data = labelData.labelUrl.split(',')[1]
        const binaryData = atob(base64Data)
        const arrayBuffer = new ArrayBuffer(binaryData.length)
        const uint8Array = new Uint8Array(arrayBuffer)
        
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i)
        }
        
        const blob = new Blob([uint8Array], { type: 'application/pdf' })
        const pdfUrl = URL.createObjectURL(blob)
        
        const printWindow = window.open(pdfUrl, '_blank')
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print()
              // Limpiar el objeto URL después de imprimir
              setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
            }, 500)
          }
        }
      } else {
        // Es una URL normal
        const printWindow = window.open(labelData.labelUrl, '_blank')
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
          }
        }
      }
    }
  }

  const downloadLabel = () => {
    if (labelData?.labelUrl) {
      if (labelData.labelUrl.startsWith('data:application/pdf')) {
        // Es un PDF base64, crear un blob y descargar
        const base64Data = labelData.labelUrl.split(',')[1]
        const binaryData = atob(base64Data)
        const arrayBuffer = new ArrayBuffer(binaryData.length)
        const uint8Array = new Uint8Array(arrayBuffer)
        
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i)
        }
        
        const blob = new Blob([uint8Array], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `etiqueta-aex-${orderId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Limpiar el objeto URL después de descargar
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      } else {
        // Es una URL normal
        const link = document.createElement('a')
        link.href = labelData.labelUrl
        link.download = `etiqueta-aex-${orderId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  const totalWeight = packages.reduce((sum, pkg) => sum + pkg.peso, 0)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            setLabelData(null)
            setError(null)
          }}
        >
          <Package className="h-4 w-4" />
          Generar Etiqueta AEX
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Etiqueta de Envío AEX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del envío */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Pedido</p>
              <p className="font-medium font-mono">{orderId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peso Total</p>
              <p className="font-medium">{totalWeight.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Origen</p>
              <p className="font-medium">{origin}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Destino</p>
              <p className="font-medium">{destination}</p>
            </div>
          </div>

          {/* Paquetes */}
          <div>
            <h4 className="font-medium mb-2">Paquetes ({packages.length})</h4>
            <div className="space-y-2">
              {packages.map((pkg, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Paquete {index + 1}</span>
                  <div className="text-sm text-muted-foreground">
                    {pkg.peso}kg • {pkg.largo}x{pkg.ancho}x{pkg.alto}cm
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Etiqueta generada */}
          {labelData && (
            <div className="space-y-4">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Etiqueta generada exitosamente</span>
                </div>
                
                {labelData.trackingNumber && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Número de Seguimiento</p>
                    <p className="font-mono font-medium">{labelData.trackingNumber}</p>
                  </div>
                )}

                {labelData?.labelUrl && (
                  <div className="mt-4">
                    {labelData.labelUrl.startsWith('data:application/pdf') ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">Vista previa de la etiqueta PDF</p>
                        <div className="bg-gray-100 rounded p-4">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Etiqueta AEX generada</p>
                          <p className="text-xs text-gray-500 mt-1">Número: {labelData.trackingNumber}</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={labelData.labelUrl} 
                        alt="Etiqueta AEX" 
                        className="w-full max-w-md mx-auto border rounded"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button 
                  onClick={printLabel}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Etiqueta
                </Button>
                <Button 
                  variant="outline"
                  onClick={downloadLabel}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}

          {/* Botón generar */}
          {!labelData && (
            <div className="flex justify-center">
              <Button 
                onClick={generateLabel}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando etiqueta...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Generar Etiqueta AEX
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Sandbox notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-700">
                🔧 Modo Desarrollo - Se generará una etiqueta de ejemplo
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
