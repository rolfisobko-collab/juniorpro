export interface CTA {
  id: string
  title: string
  title_pt?: string
  description: string
  description_pt?: string
  buttonText: string
  buttonText_pt?: string
  buttonLink: string
  imageDesktop: string
  imageMobile: string
  desktopWidth: number
  desktopHeight: number
  mobileWidth: number
  mobileHeight: number
  position: number
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export const defaultCTAs: CTA[] = [
  {
    id: "1",
    title: "iPhone 17 Pro Max",
    title_pt: "iPhone 17 Pro Max",
    description: "El futuro en tus manos. Chip A19 Pro y cámara revolucionaria.",
    description_pt: "O futuro em suas mãos. Chip A19 Pro e câmera revolucionária.",
    buttonText: "Comprar Ahora",
    buttonText_pt: "Comprar Agora",
    buttonLink: "/products/prod_1770627714955_31_vosqjsbib",
    imageDesktop: "https://i.ebayimg.com/images/g/zcgAAeSw~d5owejX/s-l1200.jpg",
    imageMobile: "https://i.ebayimg.com/images/g/zcgAAeSw~d5owejX/s-l800.jpg",
    desktopWidth: 280,
    desktopHeight: 210,
    mobileWidth: 240,
    mobileHeight: 180,
    position: 1,
    isActive: true,
    backgroundColor: "#000000",
    textColor: "#ffffff",
  },
  {
    id: "2",
    title: "Fragancias de Lujo",
    title_pt: "Fragrâncias de Luxo",
    description: "Perfumes exclusivos de las mejores casas del mundo",
    description_pt: "Perfumes exclusivos das melhores casas do mundo",
    buttonText: "Explorar",
    buttonText_pt: "Explorar",
    buttonLink: "/products?category=perfumes",
    imageDesktop: "/luxury-perfume-bottles-elegant-display.jpg",
    imageMobile: "/luxury-perfume-mobile-banner.jpg",
    desktopWidth: 1200,
    desktopHeight: 600,
    mobileWidth: 600,
    mobileHeight: 800,
    position: 2,
    isActive: true,
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
  },
]
