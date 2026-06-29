"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { useOrderStats } from "@/hooks/use-order-stats"
import { cn } from "@/lib/utils"
import type { Permission } from "@/lib/admin-users-data"
import { BrandingLogo } from "./branding-logo"
import {
  FileText,
  FolderTree,
  Grid3x3,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Palette,
  Phone,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TrendingUp,
  UserCog,
  Users,
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
    label: "Catalogo",
    items: [
      { href: "/panel/products", label: "Productos", icon: Package, permission: "products" as Permission },
      { href: "/panel/images", label: "Imagenes masivas", icon: Images, permission: "products" as Permission },
      { href: "/panel/images/brands", label: "Imagenes de marcas", icon: Images, permission: "products" as Permission },
      { href: "/panel/categories", label: "Categorias", icon: FolderTree, permission: "categories" as Permission },
      { href: "/panel/brands", label: "Marcas", icon: Tag, permission: "products" as Permission },
    ],
  },
  {
    label: "Ventas",
    items: [
      { href: "/panel/orders", label: "Pedidos", icon: ShoppingBag, permission: "orders" as Permission },
      { href: "/panel/carts", label: "Carritos", icon: ShoppingCart, permission: "carts" as Permission },
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
      { href: "/panel/home-categories", label: "Categorias Home", icon: Grid3x3, permission: "home_categories" as Permission },
      { href: "/panel/legal-content", label: "Contenido Legal", icon: FileText, permission: "legal_content" as Permission },
      { href: "/panel/branding", label: "Branding y Logo", icon: Palette, permission: "dashboard" as Permission },
      { href: "/panel/contact", label: "Informacion de Contacto", icon: Phone, permission: "dashboard" as Permission },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { admin, logout, hasPermission } = useAdmin()
  const { stats } = useOrderStats()

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-[#0d1117]">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <BrandingLogo href="/panel" variant="sidebar" />
        <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-500">Panel Admin</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasPermission(item.permission))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label}>
              <div className="mb-1.5 flex items-center gap-2 px-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{group.label}</p>
                {group.label === "Ventas" && stats.pending > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{stats.pending}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                          isActive ? "bg-[#009FE3]/15 font-semibold text-[#009FE3]" : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-100",
                        )}
                      >
                        <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#009FE3]" : "text-gray-500 group-hover:text-gray-300")} />
                        <span className="text-[13px]">{item.label}</span>
                        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#009FE3]" />}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#009FE3]/30 bg-[#009FE3]/20">
            <span className="text-xs font-bold text-[#009FE3]">{admin?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-200">{admin?.name}</p>
            <p className="truncate text-[10px] text-gray-500">@{admin?.username}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500 transition-all duration-150 hover:bg-red-500/10 hover:text-red-400">
          <LogOut className="h-4 w-4" />
          Cerrar Sesion
        </button>
      </div>
    </aside>
  )
}
