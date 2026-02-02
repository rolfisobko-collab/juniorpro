"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, MessageCircle, Smartphone, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { getContactConfig, type ContactConfig } from "@/lib/contact-data"
import { BrandingLogo } from "@/components/branding-logo"
import { useTranslation } from "@/lib/i18n/translation-provider"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"

export default function Footer() {
  const { t } = useTranslation()
  const [contact, setContact] = useState<ContactConfig>(getContactConfig())

  useEffect(() => {
    // Load initial data
    setContact(getContactConfig())

    // Listen for storage changes
    const handleStorageChange = () => {
      setContact(getContactConfig())
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return Facebook
      case "instagram":
        return Instagram
      case "twitter":
        return Twitter
      case "linkedin":
        return Linkedin
      case "youtube":
        return Youtube
      default:
        return Facebook
    }
  }

  return (
    <footer className="relative z-[99999] border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8">
          {/* Company Info */}
          <div className="space-y-4">
            <BrandingLogo href="/" variant="footer" />
            <p className="text-sm text-muted-foreground text-pretty">{t('Your premium destination for cutting-edge technology, smart appliances and exclusive fragrances from the most prestigious brands in the world')}</p>
            {/* Social Media */}
            <div className="flex flex-col gap-3 pt-2">
              {contact.socialLinks
                .filter((social) => social.enabled && social.platform.toLowerCase() === 'instagram')
                .map((social) => {
                  const Icon = getSocialIcon(social.platform)
                  return (
                    <Link
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-50 group-hover:to-pink-50">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                          <div className="relative rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-2 transition-all duration-300 group-hover:scale-110">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-purple-900">Instagram</p>
                          <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-purple-700">@techzone_store.cde</p>
                        </div>
                        <div className="text-purple-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              
              {/* WhatsApp Contact Buttons */}
              <a
                href="https://wa.me/595982245365"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-green-50 group-hover:to-emerald-50">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-2 transition-all duration-300 group-hover:scale-110">
                      <WhatsAppIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-900">+595 982 245 365</p>
                    <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-green-700">Diego Villalba - Vendedor</p>
                  </div>
                  <div className="text-green-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </a>
              <a
                href="https://wa.me/595985654487"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-green-50 group-hover:to-emerald-50">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-2 transition-all duration-300 group-hover:scale-110">
                      <WhatsAppIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-900">+595 985 654 487</p>
                    <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-green-700">Johny Ortigoza - Vendedor</p>
                  </div>
                  <div className="text-green-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </a>
              <a
                href="https://wa.me/595982639445"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-green-50 group-hover:to-emerald-50">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-2 transition-all duration-300 group-hover:scale-110">
                      <WhatsAppIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-900">+595 982 639 445</p>
                    <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-green-700">Diego Maidana - Vendedor</p>
                  </div>
                  <div className="text-green-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </a>
              <a
                href="https://wa.me/595986664625"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-green-50 group-hover:to-emerald-50">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative rounded-full bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-2 transition-all duration-300 group-hover:scale-110">
                      <WhatsAppIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-900">+595 986 664 625</p>
                    <p className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-green-700">Karen Mendoza - Vendedora</p>
                  </div>
                  <div className="text-green-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('Explore')}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('All Products')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=electronics"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('Electronics')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=appliances"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('Appliances')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=perfumes"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('Perfumes')}
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('My Favorites')}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('My Orders')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('Legal')}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/legal#terminos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('Terms and Conditions Link')}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal#privacidad"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('Privacy Policy Link')}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal#envios"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('Shipping and Warranty')}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal#devoluciones"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('Returns Link')}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal#faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('FAQ Link')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('Footer Contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('Footer Address')}</p>
                  <p className="text-sm text-muted-foreground">
                    {contact.address}
                    <br />
                    {contact.city}, {contact.country}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('Footer Phone')}</p>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {contact.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('Footer Email')}</p>
                  <a href={`mailto:${contact.email}`} className="text-sm text-muted-foreground hover:text-primary">
                    {contact.email}
                  </a>
                </div>
              </li>
            </ul>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">{t('Attention Hours')}</p>
              <p className="text-sm font-medium">{t('Monday to Friday: 9:00 - 18:00')}</p>
              <p className="text-sm font-medium">{t('Saturday: 10:00 - 14:00')}</p>
              <p className="text-xs text-muted-foreground font-medium">{t('Sunday: Closed')}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              {t('© 2026 TechZone. All rights reserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
