"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, Phone, ShoppingBag, ChevronRight } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"

const whatsappContacts = [
  { name: "Junior Alcaraz", role: "Director", phone: "+595993506124", highlight: true },
  { name: "Diego Villalba", role: "Vendedor", phone: "+595982245365" },
  { name: "Johny Ortigoza", role: "Vendedor", phone: "+595985654487" },
  { name: "Diego Maidana", role: "Vendedor", phone: "+595982639445" },
  { name: "Karen Mendoza", role: "Vendedora", phone: "+595986664625" },
]


const platformConfig: Record<string, { label: string; gradient: string; icon: React.ReactNode }> = {
  instagram: {
    label: "Instagram",
    gradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  tiktok: {
    label: "TikTok",
    gradient: "linear-gradient(135deg, #010101, #69C9D0)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
}

const contact = {
  address: "Shopping Hwu 1 Salón 212",
  city: "Ciudad del Este",
  country: "Alto Paraná, Paraguay",
  phone: "+595 0993 506124",
  weekdays: "Lun - Sáb: 6:30 - 15:30",
  saturday: "Domingo: Cerrado",
}

export default function LinksPage() {

  return (
    <div className="min-h-screen relative flex flex-col items-center overflow-x-hidden" style={{ paddingTop: 0 }}>
      {/* Fondo animado */}
      <div className="fixed inset-0 -z-10" style={{
        background: "radial-gradient(ellipse at 20% 20%, #1e3a5f 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #0f2744 0%, transparent 50%), linear-gradient(135deg, #050d1a 0%, #0a1929 50%, #050d1a 100%)"
      }} />
      {/* Glow orbs decorativos */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #009FE3, transparent)" }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />

      <div className="w-full max-w-md mx-auto px-5 py-10 flex flex-col items-center" style={{ animation: "linksPageIn 0.5s ease-out both" }}>

        {/* Header — Logo grande */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Image
            src="/logo-optimized.png"
            alt="TechZone"
            width={320}
            height={320}
            className="object-contain drop-shadow-2xl"
            priority
            style={{ animation: "logoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}
          />
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <MapPin className="w-3 h-3" />
            <span>{contact.address}, {contact.city}</span>
          </div>
        </div>

        {/* Separador */}
        <div className="w-full h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(0,159,227,0.3), transparent)" }} />

        <div className="w-full space-y-3">

          {/* Tienda online — CTA principal */}
          <Link
            href="/"
            className="group relative flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-white font-bold shadow-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{ background: "linear-gradient(135deg, #009FE3 0%, #0070a0 50%, #005580 100%)" }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #00b8ff, #009FE3)" }} />
            <div className="relative w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="relative flex-1 text-base">Visitá nuestra tienda online</span>
            <ChevronRight className="relative w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* WhatsApp */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 pt-2">
              <div className="h-px flex-1 bg-white/10" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">WhatsApp</p>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            {whatsappContacts.map((c, i) => (
              <a
                key={c.phone}
                href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
                style={c.highlight
                  ? { background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 20px rgba(34,197,94,0.3)" }
                  : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.highlight ? "rgba(255,255,255,0.2)" : "rgba(34,197,94,0.25)" }}>
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white leading-tight">{c.name}
                    {c.highlight && <span className="ml-2 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">Director</span>}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">{c.phone}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </a>
            ))}
          </div>

          {/* Redes Sociales — hardcoded */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 pt-2">
              <div className="h-px flex-1 bg-white/10" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Redes Sociales</p>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            {[
              { platform: "instagram", url: "https://www.instagram.com/techzone_store.cde/" },
              { platform: "tiktok",   url: "https://www.tiktok.com/@junioralcaraz07" },
            ].map(s => {
              const cfg = platformConfig[s.platform]
              return (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
                  style={{ background: cfg.gradient, boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    {cfg.icon}
                  </div>
                  <span className="flex-1">{cfg.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </a>
              )
            })}
          </div>

          {/* Contacto directo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 pt-2">
              <div className="h-px flex-1 bg-white/10" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Contacto</p>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="group flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.2)" }}>
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <span className="flex-1 text-sm font-medium text-white">{contact.phone}</span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0" />
            </a>
          </div>

          {/* Horarios + dirección */}
          <div className="mt-2 px-5 py-4 rounded-2xl space-y-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" style={{ color: "#009FE3" }} />
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Horarios de atención</span>
            </div>
            <p className="text-sm text-white/80 font-medium">{contact.weekdays}</p>
            <p className="text-sm text-white/40">{contact.saturday}</p>
            <div className="flex items-start gap-2 pt-1 border-t border-white/5">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#009FE3" }} />
              <p className="text-sm text-white/60">{contact.address}, {contact.city}, {contact.country}</p>
            </div>
          </div>

        </div>

        <p className="mt-10 text-xs text-white/20 text-center">© {new Date().getFullYear()} TechZone · Ciudad del Este, Paraguay</p>
      </div>
    </div>
  )
}
