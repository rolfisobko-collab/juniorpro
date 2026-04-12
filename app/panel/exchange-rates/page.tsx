"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PanelLayout } from "@/components/panel-layout"
import { RefreshCw, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExchangeRate {
  id: string
  currency: string
  rate: number
  isActive: boolean
  updatedAt: string
}

const CURRENCIES = [
  { code: "USD", name: "Dólar Estadounidense", flag: "🇺🇸" },
  { code: "PYG", name: "Guaraní Paraguayo", flag: "🇵🇾" },
  { code: "ARS", name: "Peso Argentino", flag: "🇦🇷" },
  { code: "BRL", name: "Real Brasileño", flag: "🇧🇷" },
]

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/exchange-rates")
      if (response.ok) {
        const data = await response.json()
        const rates = data.rates || []
        
        // Si no hay tasas en la respuesta, usar las tasas mock iniciales
        if (rates.length === 0) {
          console.log("No rates found, using mock rates")
          const mockRates = [
            { id: "1", currency: "USD", rate: 1.0, isActive: true, updatedAt: new Date().toISOString() },
            { id: "2", currency: "PYG", rate: 7350.0, isActive: true, updatedAt: new Date().toISOString() },
            { id: "3", currency: "ARS", rate: 890.0, isActive: true, updatedAt: new Date().toISOString() },
            { id: "4", currency: "BRL", rate: 5.2, isActive: true, updatedAt: new Date().toISOString() },
          ]
          setRates(mockRates)
        } else {
          setRates(rates)
        }
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      // Si hay error, usar tasas mock
      const mockRates = [
        { id: "1", currency: "USD", rate: 1.0, isActive: true, updatedAt: new Date().toISOString() },
        { id: "2", currency: "PYG", rate: 7350.0, isActive: true, updatedAt: new Date().toISOString() },
        { id: "3", currency: "ARS", rate: 890.0, isActive: true, updatedAt: new Date().toISOString() },
        { id: "4", currency: "BRL", rate: 5.2, isActive: true, updatedAt: new Date().toISOString() },
      ]
      setRates(mockRates)
    } finally {
      setLoading(false)
    }
  }

  const updateFromAPI = async () => {
    setUpdating(true)
    try {
      const response = await fetch("/api/exchange-rates/update", { method: "POST" })
      if (response.ok) {
        await fetchRates()
        toast({
          title: "Tasas actualizadas",
          description: "Las tasas de cambio se han actualizado desde la API externa",
        })
      } else {
        throw new Error("Error updating rates")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las tasas automáticamente",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const saveRates = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/exchange-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates }),
      })

      if (response.ok) {
        toast({
          title: "Guardado exitoso",
          description: "Las tasas de cambio se han guardado correctamente",
        })
      } else {
        throw new Error("Error saving rates")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las tasas de cambio",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateRate = (id: string, field: keyof ExchangeRate, value: any) => {
    setRates(prev =>
      prev.map(rate =>
        rate.id === id ? { ...rate, [field]: value } : rate
      )
    )
  }

  const getCurrencyInfo = (code: string) => {
    return CURRENCIES.find(c => c.code === code) || { code, name: code, flag: "🏳️" }
  }

  const formatRate = (rate: number, currency: string) => {
    if (currency === "PYG") return `₲ ${rate.toLocaleString("es-PY", { maximumFractionDigits: 0 })}`
    if (currency === "ARS") return `$ ${rate.toLocaleString("es-PY", { maximumFractionDigits: 0 })}`
    if (currency === "BRL") return `R$ ${rate.toLocaleString("es-PY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return rate.toFixed(4)
  }

  if (loading) {
    return (
      <PanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PanelLayout>
    )
  }

  return (
    <PanelLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tasas de Cambio</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las tasas de cambio para Dólar, Guaraní, Peso Argentino y Real Brasileño
          </p>
        </div>

        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Los valores se ingresan manualmente</p>
            <p className="text-amber-700 mt-0.5">No hay conexión automática a una API de cotizaciones. Actualizá los valores según el tipo de cambio del día y guardá. Se usan para convertir precios en USD a cada moneda en la tienda y para calcular el monto en Guaraníes que se envía a Bancard.</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={saveRates}
            disabled={saving}
            className="flex items-center gap-2 bg-[#009FE3] hover:bg-[#0088c7]"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button
            onClick={fetchRates}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recargar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {rates.map((rate) => {
            const currencyInfo = getCurrencyInfo(rate.currency)
            const isUSD = rate.currency === "USD"
            
            return (
              <Card key={rate.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{currencyInfo.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        {currencyInfo.name}
                        <Badge variant={rate.isActive ? "default" : "secondary"}>
                          {rate.currency}
                        </Badge>
                        {isUSD && (
                          <Badge variant="outline" className="text-xs">
                            Base
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-normal">
                        Última actualización: {new Date(rate.updatedAt).toLocaleString("es-PY")}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`rate-${rate.id}`}>Tasa de cambio</Label>
                      <Input
                        id={`rate-${rate.id}`}
                        type="number"
                        step="0.0001"
                        value={rate.rate}
                        onChange={(e) => updateRate(rate.id, "rate", parseFloat(e.target.value) || 0)}
                        disabled={isUSD}
                        placeholder={isUSD ? "1.0000 (base)" : "0.0000"}
                      />
                      {isUSD && (
                        <p className="text-xs text-muted-foreground mt-1">
                          El USD es la moneda base (tasa = 1)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`active-${rate.id}`}
                          checked={rate.isActive}
                          onCheckedChange={(checked) => updateRate(rate.id, "isActive", checked)}
                          disabled={isUSD}
                        />
                        <Label htmlFor={`active-${rate.id}`} className="text-sm">
                          Activa
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {!isUSD && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="font-medium text-gray-700">
                        1 USD = {formatRate(rate.rate, rate.currency)}
                      </p>
                      <p className="mt-0.5">
                        1 {rate.currency} = USD {(1 / rate.rate).toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {rates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tasas configuradas</h3>
              <p className="text-muted-foreground text-center mb-4">
                Haz clic en "Actualizar desde API" para obtener las tasas actuales o configúralas manualmente.
              </p>
              <Button onClick={updateFromAPI} disabled={updating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${updating ? "animate-spin" : ""}`} />
                Obtener tasas iniciales
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PanelLayout>
  )
}
