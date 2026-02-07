"use client"

import { useState, useEffect } from "react"
import { X, MessageCircle, Phone } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"

export default function WhatsAppFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)

  const whatsappContacts = [
    {
      name: "Junior Alcaraz",
      role: "Director",
      phone: "+595993506124",
      color: "from-purple-500 to-purple-600",
      highlighted: true
    },
    {
      name: "Diego Villalba",
      role: "Vendedor",
      phone: "+595982245365",
      color: "from-green-500 to-green-600"
    },
    {
      name: "Johny Ortigoza", 
      role: "Vendedor",
      phone: "+595985654487",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      name: "Diego Maidana",
      role: "Vendedor", 
      phone: "+595982639445",
      color: "from-teal-500 to-teal-600"
    },
    {
      name: "Karen Mendoza",
      role: "Vendedora",
      phone: "+595986664625", 
      color: "from-green-600 to-green-700"
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Botones desplegables */}
      <div className={`flex flex-col gap-3 transition-all duration-500 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {whatsappContacts.map((contact, index) => (
          <div
            key={contact.phone}
            className={`flex items-center gap-3 bg-white rounded-2xl shadow-xl border ${
              contact.highlighted ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-white' : 'border-gray-100'
            } p-3 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group`}
            style={{
              animationDelay: isOpen ? `${index * 100}ms` : '0ms',
              animation: isOpen ? 'slideInRight 0.4s ease-out forwards' : 'slideOutRight 0.3s ease-in forwards'
            }}
            onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g, '')}`, '_blank')}
          >
            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
              contact.highlighted ? 'ring-2 ring-purple-300 ring-offset-2' : ''
            }`}>
              <WhatsAppIcon className="w-6 h-6 text-white" />
              {contact.highlighted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">★</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm group-hover:text-green-700 transition-colors ${
                contact.highlighted ? 'text-purple-900' : 'text-gray-900'
              }`}>
                {contact.name}
                {contact.highlighted && (
                  <span className="ml-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Director</span>
                )}
              </p>
              <p className={`text-xs group-hover:text-green-600 transition-colors ${
                contact.highlighted ? 'text-purple-700 font-medium' : 'text-gray-600'
              }`}>
                {contact.role}
              </p>
              <p className={`text-xs font-medium group-hover:text-green-800 transition-colors ${
                contact.highlighted ? 'text-purple-800' : 'text-gray-700'
              }`}>
                {contact.phone}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              contact.highlighted ? 'bg-purple-100 group-hover:bg-purple-200' : 'bg-green-100 group-hover:bg-green-200'
            }`}>
              <Phone className={`w-4 h-4 ${
                contact.highlighted ? 'text-purple-600' : 'text-green-600'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Botón principal flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-3xl group ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}
      >
        {/* Icono */}
        {isOpen ? (
          <X className="w-7 h-7 text-white relative z-10" />
        ) : (
          <WhatsAppIcon className="w-8 h-8 text-white relative z-10" />
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          {isOpen ? 'Cerrar' : 'Contactanos por WhatsApp'}
          <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>

        {/* Badge de notificación */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">5</span>
          </div>
        )}
      </button>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }
      `}</style>
    </div>
  )
}
