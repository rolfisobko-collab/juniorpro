export interface SocialLink {
  platform: string
  url: string
  enabled: boolean
}

export interface ContactConfig {
  id: string
  description: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  workingHours: {
    weekdays: string
    saturday: string
  }
  socialLinks: SocialLink[]
  updatedAt: string
}

export let contactConfig: ContactConfig = {
  id: "1",
  description:
    "Tu destino premium para tecnología de vanguardia, electrodomésticos inteligentes y fragancias exclusivas de las marcas más prestigiosas del mundo.",
  address: "Shopping Hwu 1 Salón 212",
  city: "Ciudad del Este",
  country: "Alto Paraná, Paraguay",
  phone: "+595 0993 506124",
  email: "contacto@techzone.com",
  workingHours: {
    weekdays: "Lun - Sáb: 6:30 - 15:30",
    saturday: "Domingo: Cerrado",
  },
  socialLinks: [
    { platform: "facebook", url: "https://facebook.com/techzone", enabled: true },
    { platform: "instagram", url: "https://www.instagram.com/techzone_store.cde/", enabled: true },
    { platform: "twitter", url: "https://twitter.com/techzone", enabled: true },
    { platform: "linkedin", url: "https://linkedin.com/company/techzone", enabled: true },
    { platform: "youtube", url: "https://youtube.com/techzone", enabled: true },
  ],
  updatedAt: new Date().toISOString(),
}

export const getContactConfig = (): ContactConfig => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("contact_config")
    if (stored) {
      contactConfig = JSON.parse(stored)
    }
  }
  return contactConfig
}

export const updateContactConfig = (config: Partial<ContactConfig>): ContactConfig => {
  contactConfig = {
    ...contactConfig,
    ...config,
    updatedAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("contact_config", JSON.stringify(contactConfig))
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"))
  }

  return contactConfig
}
