"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { CreditCard, Lock, Truck, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    firstName: user?.name.split(" ")[0] || "",
    lastName: user?.name.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    shippingMethod: "standard",
  })

  const shippingCost = total >= 100 ? 0 : formData.shippingMethod === "express" ? 25 : 15
  const taxAmount = total * 0.1
  const finalTotal = total + shippingCost + taxAmount

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login?redirect=/checkout")
      return
    }

    setIsProcessing(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shipping: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            method: formData.shippingMethod,
          },
          contact: {
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      if (!res.ok) {
        throw new Error("No se pudo crear el pedido")
      }

      const data = (await res.json()) as { order?: { id: string } }
      const orderId = data.order?.id
      if (!orderId) {
        throw new Error("Respuesta inválida")
      }

      clearCart()
      router.push(`/checkout/success?orderId=${orderId}`)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  if (items.length === 0) return null

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Finalizar Compra</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Información de Envío</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre *</Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido *</Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="Calle, número, departamento"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado/Provincia *</Label>
                        <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Código Postal *</Label>
                        <Input
                          id="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={(e) => handleChange("zipCode", e.target.value)}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Método de Envío</h2>
                    </div>

                    <RadioGroup
                      value={formData.shippingMethod}
                      onValueChange={(value) => handleChange("shippingMethod", value)}
                    >
                      <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">Envío Estándar</p>
                              <p className="text-sm text-muted-foreground">5-7 días hábiles</p>
                            </div>
                            <p className="font-bold">{total >= 100 ? "Gratis" : "$15.00"}</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">Envío Express</p>
                              <p className="text-sm text-muted-foreground">2-3 días hábiles</p>
                            </div>
                            <p className="font-bold">$25.00</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Información de Pago</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
                      <Input
                        id="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={(e) => handleChange("cardNumber", e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nombre en la Tarjeta *</Label>
                      <Input
                        id="cardName"
                        required
                        value={formData.cardName}
                        onChange={(e) => handleChange("cardName", e.target.value)}
                        placeholder="JUAN PEREZ"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Vencimiento *</Label>
                        <Input
                          id="cardExpiry"
                          required
                          value={formData.cardExpiry}
                          onChange={(e) => handleChange("cardExpiry", e.target.value)}
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV *</Label>
                        <Input
                          id="cardCvv"
                          required
                          value={formData.cardCvv}
                          onChange={(e) => handleChange("cardCvv", e.target.value)}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <Lock className="h-4 w-4" />
                      <span>Tus datos de pago están seguros y encriptados</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-bold pb-4 border-b border-border">Resumen del Pedido</h2>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                            <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impuestos</span>
                        <span className="font-medium">${taxAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-baseline mb-6">
                        <span className="font-semibold text-lg">Total</span>
                        <span className="font-bold text-3xl font-serif">${finalTotal.toFixed(2)}</span>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Procesando..." : "Realizar Pedido"}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-4">
                        Al realizar tu pedido, aceptas nuestros términos y condiciones
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
