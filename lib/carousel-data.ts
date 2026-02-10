export interface CarouselSlide {
  id: number
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  image: string
  imageMobile: string
  backgroundColor: string
  textColor: string
  position: number
  isActive: boolean
}

export const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: "iPhone 17 Pro Max",
    subtitle: "Titanio. Tan fuerte. Tan ligero. Tan Pro.",
    description: "El smartphone más avanzado con chip A19 Pro y sistema de cámara revolucionario",
    buttonText: "Comprar Ahora",
    buttonLink: "/products/prod_1770627714955_31_vosqjsbib",
    image: "https://i.ebayimg.com/images/g/zcgAAeSw~d5wejX/s-l1200.jpg",
    imageMobile: "https://i.ebayimg.com/images/g/zcgAAeSw~d5wejX/s-l800.jpg",
    backgroundColor: "#1a1a1a",
    textColor: "#ffffff",
    position: 1,
    isActive: true,
  },
  {
    id: 2,
    title: "Fragancias de Lujo",
    subtitle: "Elegancia en cada gota",
    description: "Descubre nuestra colección exclusiva de perfumes de alta gama",
    buttonText: "Explorar Colección",
    buttonLink: "/products?category=perfumes",
    image: "/luxury-perfume-bottles-elegant-display.jpg",
    imageMobile: "/luxury-perfume-mobile-banner.jpg",
    backgroundColor: "#2c1810",
    textColor: "#f5e6d3",
    position: 2,
    isActive: true,
  },
  {
    id: 3,
    title: "MacBook Pro 16",
    subtitle: "Potencia sin límites",
    description: "El portátil más potente para profesionales creativos con chip M3 Max",
    buttonText: "Ver Detalles",
    buttonLink: "/products/2",
    image: "/macbook-pro-16-inch-laptop-premium.jpg",
    imageMobile: "/macbook-pro-16-inch-laptop-premium.jpg",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    position: 3,
    isActive: true,
  },
]
