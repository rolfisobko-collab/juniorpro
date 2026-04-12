"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { useOrderStats } from "@/hooks/use-order-stats"
import { cn } from "@/lib/utils"
import type { Permission } from "@/lib/admin-users-data"
import { BrandingLogo } from "./branding-logo"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  ShoppingCart,
  Megaphone,
  UserCog,
  LogOut,
  FileText,
  Images,
  Grid3x3,
  Palette,
  Phone,
  TrendingUp,
  Tag,
} from "lucide-react"

const menuGroups = [
  {
    label: "General",
    items: [
      { href: "/panel", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" as Permission },
      { href: "/panel/exchange-rates", label: "Tasas de Cambio", icon: TrendingUp, permission: "dashboard" as Permission },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/panel/products", label: "Productos", icon: Package, permission: "products" as Permission },
      { href: "/panel/images", label: "Imágenes masivas", icon: Images, permission: "products" as Permission },
      { href: "/panel/images/brands", label: "Imágenes de marcas", icon: Images, permission: "products" as Permission },
      { href: "/panel/categories", label: "Categorías", icon: FolderTree, permission: "categories" as Permission },
      { href: "/panel/brands", label: "Marcas", icon: Tag, permission: "products" as Permission },
    ],
  },
  {
    label: "Ventas",
    items: [
      { href: "/panel/orders", label: "Pedidos", icon: ShoppingBag, permission: "orders" as Permission },
      { href: "/panel/carts", label: "Carritos", icon: ShoppingCart, permission: "carts" as Permission },
      { href: "/panel/cajas", label: "Cajas de Envío", icon: Package, permission: "orders" as Permission },
    ],
  },
  {
    label: "Usuarios",
    items: [
      { href: "/panel/users", label: "Clientes", icon: Users, permission: "users" as Permission },
      { href: "/panel/admin-users", label: "Administradores", icon: UserCog, permission: "admin_users" as Permission },
    ],
  },
  {
    label: "Contenido",
    items: [
      { href: "/panel/carousel", label: "Carrusel", icon: Images, permission: "carousel" as Permission },
      { href: "/panel/ctas", label: "CTAs", icon: Megaphone, permission: "ctas" as Permission },
      {
        href: "/panel/home-categories",
        label: "Categorías Home",
        icon: Grid3x3,
        permission: "home_categories" as Permission,
      },
      {
        href: "/panel/legal-content",
        label: "Contenido Legal",
        icon: FileText,
        permission: "legal_content" as Permission,
      },
      { href: "/panel/branding", label: "Branding y Logo", icon: Palette, permission: "dashboard" as Permission },
      { href: "/panel/contact", label: "Información de Contacto", icon: Phone, permission: "dashboard" as Permission },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { admin, logout, hasPermission } = useAdmin()
  const { stats } = useOrderStats()

  return (
    <aside className="w-64 flex flex-col h-screen fixed top-0 left-0 z-50 bg-[#0d1117] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <BrandingLogo href="/panel" variant="sidebar" />
        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Panel Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasPermission(item.permission))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label}>
              <div className="flex items-center gap-2 px-2 mb-1.5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">{group.label}</p>
                {group.label === "Ventas" && stats.pending > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {stats.pending}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer group",
                        isActive
                          ? "bg-[#009FE3]/15 text-[#009FE3] font-semibold"
                          : "text-gray-400 hover:text-gray-100 hover:bg-white/[0.05]"
                      )}>
                        <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#009FE3]" : "text-gray-500 group-hover:text-gray-300")} />
                        <span className="text-[13px]">{item.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#009FE3]" />}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer usuario */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] mb-2">
          <div className="h-8 w-8 rounded-full bg-[#009FE3]/20 border border-[#009FE3]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[#009FE3] text-xs font-bold">{admin?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-200 truncate">{admin?.name}</p>
            <p className="text-[10px] text-gray-500 truncate">@{admin?.username}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
