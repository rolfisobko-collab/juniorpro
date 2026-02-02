"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { useOrderStats } from "@/hooks/use-order-stats"
import { Button } from "@/components/ui/button"
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
  ChevronDown,
  ChevronRight,
  Palette,
  Phone,
  TrendingUp,
  Truck,
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
      { href: "/panel/categories", label: "Categorías", icon: FolderTree, permission: "categories" as Permission },
    ],
  },
  {
    label: "Ventas",
    items: [
      { href: "/panel/orders", label: "Pedidos", icon: ShoppingBag, permission: "orders" as Permission },
      { href: "/panel/carts", label: "Carritos", icon: ShoppingCart, permission: "carts" as Permission },
      { href: "/panel/envios", label: "Envíos", icon: Truck, permission: "orders" as Permission },
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => (prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]))
  }

  return (
    <aside className="w-64 border-r bg-gradient-to-b from-background to-muted/20 flex flex-col h-screen fixed top-0 left-0 shadow-sm z-50">
      <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <BrandingLogo href="/panel" variant="sidebar" />
      </div>

      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasPermission(item.permission))

          if (visibleItems.length === 0) return null

          const isExpanded = expandedGroups.includes(group.label)

          return (
            <div key={group.label} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center gap-2">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{group.label}</span>
                  {group.label === "Ventas" && stats.pending > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                      {stats.pending}
                    </span>
                  )}
                </div>
                <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 group-hover:text-primary transition-colors" />
                  ) : (
                    <ChevronRight className="h-3 w-3 group-hover:text-primary transition-colors" />
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="space-y-1 ml-2 pl-2 border-l-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start hover:translate-x-1 transition-all duration-200",
                            isActive &&
                              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm",
                          )}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span className="text-xs">{item.label}</span>
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="mb-3 px-3 py-2 rounded-lg bg-muted/30">
          <p className="text-sm font-semibold text-foreground">{admin?.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">@{admin?.username}</p>
          <div className="mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium inline-block">
            {admin?.role}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start bg-background/50 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
