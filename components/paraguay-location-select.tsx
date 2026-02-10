"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, X } from "lucide-react"

interface ParaguayLocationSelectProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: { address: string; city: string; department: string }) => void
}

// Datos de Paraguay - Todos los departamentos y distritos
const paraguayData = {
  "Alto Paraná": {
    department: "Alto Paraná",
    cities: ["Ciudad del Este", "Hernandarias", "Presidente Franco", "Puerto Iguazú", "Doctor Juan León Mallorquín", "Domingo López de Almada", "General Francisco Caballero Alvarez", "Iraty", "Itakyry", "Juan Emilio O'Leary", "Los Cedrales", "Mbaracayú", "Minga Guazú", "Naranjal", "Ñacunday", "Pitanga", "Santa Rita", "Santa Rosa del Monday", "Tavapy", "Yataity Corá", "Tres de Mayo"]
  },
  "Alto Paraguay": {
    department: "Alto Paraguay",
    cities: ["Bahía Negra", "Cerro Corá", "Fuerte Olimpo", "General Elizardo Aquino", "Puerto Casado", "Puerto Pinasco", "Capitán Pablo Lagerenza"]
  },
  "Amambay": {
    department: "Amambay",
    cities: ["Pedro Juan Caballero", "Bella Vista", "Capitán Bado", "General Caballero", "Zanja Pytá", "Puerto Casado", "Río Verde", "Ypehú"]
  },
  "Boquerón": {
    department: "Boquerón",
    cities: ["Filadelfia", "Loma Plata", "Mariscal Estigarribia", "Neuland", "Cerro León", "Doctor Pedro P. Peña", "General Eugenio A. Garay", "Mcal. Estigarribia", "Nueva Asunción", "Ovando", "Poí", "Sargento José Félix López", "Tres Hierro"]
  },
  "Caaguazú": {
    department: "Caaguazú",
    cities: ["Caaguazú", "Carayaó", "Coronel Oviedo", "General Higinio Morínigo", "Itanará", "Mcal. Estigarribia", "Naranjal", "Paso Yobai", "Raúl Arsenio Oviedo", "Repatriación", "San Joaquín", "San José de los Arroyos", "Santa Rosa del Mbutuy", "Tembiaporá", "Yhú", "3 de Mayo"]
  },
  "Caazapá": {
    department: "Caazapá",
    cities: ["Caazapá", "Abaí", "Altos", "Buena Vista", "Doctor Moisés S. Bertoni", "Fulgencio Yegros", "General Higinio Morínigo", "Itapúa", "Moisés Bertoni", "Pirayú", "San Juan Nepomuceno", "San Lorenzo", "Tavaí", "Yuty"]
  },
  "Canindeyú": {
    department: "Canindeyú",
    cities: ["Salto del Guairá", "Curuguaty", "General Francisco Caballero Alvarez", "Hernandarias", "Itanará", "Mbaracayú", "Palma del Sol", "Puerto Adela", "Puerto Casado", "San Pedro del Paraná", "Villa Hayes", "Yataity Corá"]
  },
  "Central": {
    department: "Central", 
    cities: ["Areguá", "Caacupé", "Carapeguá", "Capiatá", "Itá", "Itauguá", "Julián Augusto Saldivar", "Limpio", "Nueva Italia", "Pirayú", "San Antonio", "San José de los Arroyos", "San Juan Bautista", "San Lorenzo", "Sapucaí", "Villarrica", "Yaguarón", "Ybycuí", "Ypané", "Luque", "Lambaré", "Ñemby", "San Antonio", "Itauguá"]
  },
  "Concepción": {
    department: "Concepción",
    cities: ["Concepción", "Horqueta", "General Resquín", "Yby Pytá", "Pedro Juan Caballero", "Coronel Oviedo", "Trinidad", "Altos", "Yataity", "Tacuatí", " Paso Yobai", "Loreto", "Mcal. Estigarribia"]
  },
  "Cordillera": {
    department: "Cordillera",
    cities: ["Caaguazú", "Coronel Oviedo", "Mcal. López", "Naranjal", "Raúl Arsenio Oviedo", "San Joaquín", "San José", "Yataity", "Arroyos y Esteros", "Altos", "Atyrá", "Emboscada", "Loma Grande", "Piribebuy", "Tobatí", "Valenzuela"]
  },
  "Guairá": {
    department: "Guairá",
    cities: ["Villarrica", "Mbocayaty", "Naranjal", "Yby Pytá", "Itanará", "Paso Yobai", "Independencia", "General Higinio Morínigo", "Borja", "Capitán Mauricio José Troche", "Félix Pérez Cardozo", "Itapúa", "Mcal. Estigarribia", "Ñumí", "Pirayú", "Yataity"]
  },
  "Itapúa": {
    department: "Itapúa",
    cities: ["Encarnación", "San Juan Bautista", "San Pedro del Ycuamandiyú", "Carmen del Paraná", "Trinidad", "General Artigas", "Pirayú", "Coronel Bogado", "Alborada", "Cambyretá", "Eden", "Fram", "San Cosme y Damián", "Yatay", "Bella Vista", "Capitán Miranda", "Carlos Antonio López", "Coronel Martínez", "Edelira", "General Delgado", "Hohenau", "Jesús", "Mayor Otaño", "Natalio", "Obligado", "Patria", "San Pedro del Paraná", "Tomás Romero Pereira", "Trinidad", "Yataity Corá", "Ybycuí", "Yuty"]
  },
  "Misiones": {
    department: "Misiones",
    cities: ["San Juan Bautista", "San Ignacio", "Ayolas", "Santa María", "San Miguel", "San Pedro", "Yabebyry", "Pilar", "Santiago", "Yataity", "San Patricio", "Aguaray", "Cerro Corá", "General Alvear", "Santa Rosa", "Villa Florida"]
  },
  "Ñeembucú": {
    department: "Ñeembucú",
    cities: ["Pilar", "Capiatá", "Benjamín Aceval", "San Estanislao", "Villarrica", "Alto Verá", "Guarambaré", "Yby Pytá", "Humaitá", "General Elizardo Aquino", "Lima", "Pirayú", "Alberdi", "Desmochados", "General José María Rojas", "Obligado", "Paso Yobai", "San Antonio", "San Miguel", "Tacuaras", "Ybycuí"]
  },
  "Paraguarí": {
    department: "Paraguarí",
    cities: ["San Pedro", "San Juan Bautista", "Yhú", "San Antonio", "Escobar", "Yby Pytá", "Coronel Oviedo", "Mcal. López", "Sapucaí", "Capiatá", "Villarrica", "Guarambaré", "Pirayú", "Acahay", "Carayaó", "Caapucú", "Mbuyapey", "Quiindy", "San Roque", "Sapucaí", "Yaguarón", "Ybycuí", "Ybytimí"]
  },
  "Presidente Hayes": {
    department: "Presidente Hayes",
    cities: ["Villarrica", "San Pedro", "Benjamín Aceval", "Tres Bocas", "Alto Verá", "Pilar", "Isla Pucú", "Nanawa", "Puerto Pinasco", "Clorinda", "Puerto Casado", "Teniente Esteban Martínez", "Puerto Eva", "Villa Hayes"]
  },
  "San Pedro": {
    department: "San Pedro",
    cities: ["San Pedro de Ycuamandiyú", "Capiibary", "Choré", "General Elizardo Aquino", "Guayaibí", "Itacurubí del Rosario", "Lima", "Ñeembucú", "Puerto Casado", "Santa Rosa del Aguaray", "Tacuatí", "Unión", "Yataity", "Yby Pytá", "Yhú", "25 de Diciembre", "Antonio Irala", "Capiatá", "Coronel Bogado", "General Elizardo Aquino", "Guayaibí", "Itacurubí", "Lima", "Ñeembucú", "Puerto Casado", "Santa Rosa del Aguaray", "Tacuatí", "Unión", "Yataity", "Yby Pytá", "Yhú"]
  }
}

export default function ParaguayLocationSelect({ isOpen, onClose, onLocationSelect }: ParaguayLocationSelectProps) {
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [street, setStreet] = useState("")
  const [streetNumber, setStreetNumber] = useState("")
  const [apartment, setApartment] = useState("")

  const departments = Object.keys(paraguayData)

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department)
    setSelectedCity("")
  }

  const handleLocationSelect = () => {
    if (selectedDepartment && selectedCity && street && streetNumber) {
      const addressParts = [
        `${street} ${streetNumber}`,
        apartment && `Dept ${apartment}`,
        selectedCity,
        selectedDepartment,
        "Paraguay"
      ].filter(Boolean)

      const fullAddress = addressParts.join(", ")
      
      onLocationSelect({
        address: fullAddress,
        city: selectedCity,
        department: selectedDepartment
      })
      onClose()
    }
  }

  const currentCities = selectedDepartment ? paraguayData[selectedDepartment as keyof typeof paraguayData]?.cities || [] : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seleccionar Ubicación en Paraguay
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Departamento */}
          <div className="space-y-2">
            <Label htmlFor="department">Departamento *</Label>
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ciudad */}
          {selectedDepartment && (
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {currentCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dirección */}
          {selectedCity && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Calle *</Label>
                  <Input
                    id="street"
                    placeholder="Ej: Eusebio Ayala"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">N° *</Label>
                  <Input
                    id="number"
                    placeholder="1234"
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apartment">Departamento (Opcional)</Label>
                <Input
                  id="apartment"
                  placeholder="Ej: 3A, Torre 2, Piso 5"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Ubicación seleccionada */}
          {selectedDepartment && selectedCity && street && streetNumber && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <Label>Ubicación Seleccionada</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {street} {streetNumber}
                  {apartment && `, Dept ${apartment}`}
                  {`, ${selectedCity}, ${selectedDepartment}, Paraguay`}
                </span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleLocationSelect}
              disabled={!selectedDepartment || !selectedCity || !street || !streetNumber}
            >
              Confirmar Ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
