import bcrypt from "bcryptjs"

export type Permission =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "users"
  | "carts"
  | "ctas"
  | "carousel"
  | "home_categories"
  | "legal_content"
  | "admin_users"

export interface AdminUser {
  id: string
  email: string
  username: string
  name: string
  password: string
  passwordHash: string
  role: "superadmin" | "admin" | "editor" | "viewer"
  permissions: Permission[]
  active: boolean
  createdAt: string
  lastLogin?: string
}

export const AVAILABLE_PERMISSIONS: { value: Permission; label: string; description: string }[] = [
  { value: "dashboard", label: "Dashboard", description: "Ver estadísticas y panel principal" },
  { value: "products", label: "Productos", description: "Gestionar productos" },
  { value: "categories", label: "Categorías", description: "Gestionar categorías y subcategorías" },
  { value: "orders", label: "Pedidos", description: "Ver y gestionar pedidos" },
  { value: "users", label: "Usuarios", description: "Ver usuarios de la ecommerce" },
  { value: "carts", label: "Carritos", description: "Ver carritos abandonados" },
  { value: "ctas", label: "CTAs", description: "Gestionar banners y CTAs" },
  { value: "carousel", label: "Carrusel", description: "Gestionar slides del carrusel principal" },
  {
    value: "home_categories",
    label: "Categorías Home",
    description: "Gestionar categorías de la página principal",
  },
  { value: "legal_content", label: "Contenido Legal", description: "Editar términos, políticas y documentos legales" },
  { value: "admin_users", label: "Usuarios Admin", description: "Gestionar usuarios del panel admin" },
]

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Exportar función para inicializar
export async function initializePasswordHashes() {
  for (const user of adminUsers) {
    user.passwordHash = await hashPassword(user.password)
  }
}

// Usuarios con contraseñas hasheadas - VACÍO para eliminar datos de prueba
export const adminUsers: AdminUser[] = [
  // Solo administradores reales - eliminar datos de prueba
  // Si necesitas crear un admin real, agrégalo aquí con datos reales
]
