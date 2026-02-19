export interface BrandingConfig {
  id: string
  siteName: string
  logoText: string
  logoImage?: string
  faviconImage?: string
  primaryColor?: string
  updatedAt: string
}

export let brandingConfig: BrandingConfig = {
  id: "1",
  siteName: "TechZone",
  logoText: "T",
  logoImage: "/logo-optimized.png",
  faviconImage: "",
  primaryColor: "#0ea5e9",
  updatedAt: new Date().toISOString(),
}

export const getBrandingConfig = (): BrandingConfig => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("branding_config")
    if (stored) {
      brandingConfig = JSON.parse(stored)
    }
  }
  return brandingConfig
}

export const updateBrandingConfig = (config: Partial<BrandingConfig>): BrandingConfig => {
  brandingConfig = {
    ...brandingConfig,
    ...config,
    updatedAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("branding_config", JSON.stringify(brandingConfig))
  }

  return brandingConfig
}
