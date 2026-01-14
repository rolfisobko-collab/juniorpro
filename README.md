# TechZone E-commerce Platform

E-commerce de lujo para electrónica, electrodomésticos y perfumes de alta gama en Paraguay.

## 📅 Estado del Proyecto (2026-01-13)

### Implementado (backend real + panel conectado)

- **Base de datos**: PostgreSQL (Neon/Vercel) + Prisma ORM.
- **Auth**: usuarios y admin separados (cookies HttpOnly + refresh tokens).
- **E-commerce core**: carrito, favoritos, órdenes/checkout (incluye validación de stock y transacciones).
- **Admin**:
  - CRUD **Productos** (APIs + panel).
  - CRUD **Categorías/Subcategorías** (APIs + panel).
  - CRUD **Contenido**: Carrusel, CTAs, Home Categories (APIs + panel, incluye activación y orden).
  - **Legal/Branding/Contact**: panel guarda en DB (APIs admin protegidas).
  - **Stats**: `GET /api/admin/dashboard/stats`.

### Pendiente

- **Deploy Vercel**: configurar env vars, ejecutar migrate/seed y verificar endpoints en producción.
- **Fix TS lint**: warning/error del import de `PrismaClient` bajo `moduleResolution=bundler` (no afecta runtime).

## ✅ Checklist Deploy (Vercel)

### 1) Environment Variables (Vercel → Project → Settings → Environment Variables)

Requeridas:

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

Recomendadas:

```
NODE_ENV=production
```

### 2) Prisma (producción)

En Vercel, correr (o configurar como build/deploy step) lo siguiente:

```
npm run db:migrate:deploy
npm run db:seed
```

Notas:

- `db:migrate:deploy` ejecuta `prisma migrate deploy` contra `DATABASE_URL`.
- `db:seed` corre `prisma/seed.ts` (necesita `DATABASE_URL`).

### 3) Verificación rápida (smoke test)

Reemplazar en los comandos:

```
BASE_URL=https://TU-PROYECTO.vercel.app
```

Tip: para probar rutas protegidas por cookies (admin/user), usar `curl` con cookie jar.

```
COOKIE_JAR=./.cookies.txt
```

Backend público:

```
GET /api/products
GET /api/categories
GET /api/content/carousel
GET /api/content/ctas
GET /api/content/home-categories
```

Ejemplos:

```
curl -sS "$BASE_URL/api/products" | head
curl -sS "$BASE_URL/api/categories" | head
curl -sS "$BASE_URL/api/content/carousel" | head
curl -sS "$BASE_URL/api/content/ctas" | head
curl -sS "$BASE_URL/api/content/home-categories" | head
```

Admin:

```
POST /api/admin/login
GET  /api/admin/me
GET  /api/admin/products
GET  /api/admin/categories
GET  /api/admin/orders
```

Notas importantes:

- El login de admin usa `username` + `password` (no `email`).
- Si el login es OK, se setean cookies HttpOnly `tz_admin_access` y `tz_admin_refresh`.

Credenciales seed (por defecto):

```
username=admin
password=admin123
```

Login + verificación de sesión (usa cookie jar):

```
curl -sS -c "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  "$BASE_URL/api/admin/login" | head

curl -sS -b "$COOKIE_JAR" \
  "$BASE_URL/api/admin/me" | head
```

Verificación CRUD/listados admin:

```
curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/admin/products" | head
curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/admin/categories" | head
curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/admin/orders" | head
```

### 4) Build

Antes de deploy:

```
npm run build
```

## 🧭 Para terminar el proyecto (cuando vuelva la luz)

Este proyecto depende de que el **código esté pusheado a GitHub**, porque Vercel deploya desde el repo remoto.

### 1) Confirmar y subir cambios a Git (esto es lo que hace que Vercel tenga las APIs)

Desde la raíz del proyecto:

```bash
git status -sb
```

Si ves archivos modificados o `??` (nuevos), hacé:

```bash
# Ignorar archivos locales temporales
echo .cookies_*.txt >> .gitignore

git add -A
git commit -m "Backend APIs + Prisma + seed + panel wiring"
git push origin main
```

Notas:

- Si `git log -n 1` sigue mostrando solo `init`, significa que todavía no se subió el backend y Vercel va a servir un build viejo.

### 2) Vercel: settings mínimos para que existan `/api/*`

En Vercel → Project → Settings:

- **Framework Preset**: Next.js
- **Root Directory**: la carpeta donde está `package.json` y `app/`
- **Build Command**: `npm run build`
- **Output Directory**: vacío / default (NO usar `out`)

Si `/api/products` responde HTML 404 (`X-Matched-Path: /404`), casi seguro el deploy está apuntando a un repo/dir equivocado o el código no fue pusheado.

### 3) Prisma en producción

Con `DATABASE_URL` seteada en Vercel:

```bash
npm run db:migrate:deploy
npm run db:seed
```

Notas:

- `db:seed` requiere `.env` o variables en el entorno. Para ejecución local con `tsx`, el seed carga `.env`.

### 4) Smoke test en Vercel (comandos copy/paste)

Setear:

```bash
BASE_URL=https://TU-PROYECTO.vercel.app
COOKIE_JAR=./.cookies.txt
```

Público (debe devolver JSON, no HTML):

```bash
curl -sS -i "$BASE_URL/api/products" | head -n 20
curl -sS -i "$BASE_URL/api/categories" | head -n 20
curl -sS -i "$BASE_URL/api/content/carousel" | head -n 20
```

Admin (login por username + cookies HttpOnly):

```bash
curl -sS -c "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  "$BASE_URL/api/admin/login" | head

curl -sS -b "$COOKIE_JAR" \
  "$BASE_URL/api/admin/me" | head
```

Listados admin:

```bash
curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/admin/products" | head
curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/admin/categories" | head
curl -sS -b "$COOKIE_JAR" "$BASE_URL/api/admin/orders" | head
```

## 🚀 Características Implementadas

### Frontend (Actual - Next.js 16)
- ✅ Next.js 16 con App Router y React 19.2
- ✅ TypeScript estricto
- ✅ Tailwind CSS v4 con diseño responsive
- ✅ shadcn/ui components
- ✅ Autenticación completa (Login, Registro, Recuperación, Social OAuth)
- ✅ Carrito de compras con persistencia en localStorage
- ✅ Sistema de favoritos
- ✅ Búsqueda avanzada con filtros y ordenamiento
- ✅ Recomendaciones basadas en cookies de navegación
- ✅ Páginas de productos con detalle completo
- ✅ Checkout con múltiples métodos de envío
- ✅ Panel de administración completo en /panel
- ✅ CRUD de productos, categorías y subcategorías
- ✅ Gestión de pedidos y usuarios
- ✅ Sistema de usuarios internos con permisos granulares
- ✅ Gestión de contenido (CTAs, Carrusel, Categorías Home)
- ✅ Editor de contenido legal (Términos, Privacidad, etc.)
- ✅ **Sistema de Branding editable (Logo, Nombre del sitio)**
- ✅ **Gestión de Información de Contacto (Dirección, Teléfono, Email, Horarios, Redes Sociales)**
- ✅ Dashboard con estadísticas y métricas
- ✅ Carrusel de imágenes editable
- ✅ Navegación por categorías con mega menú
- ✅ Footer completo con enlaces legales y redes sociales editables

---

## 📁 ARQUITECTURA DEL FRONTEND ACTUAL

### Estructura de Archivos Next.js

```
app/
├── (auth)/                    # Grupo de rutas de autenticación (sin nav/footer)
│   ├── login/page.tsx        # Login usuarios cliente
│   ├── register/page.tsx     # Registro usuarios
│   └── reset-password/page.tsx
├── panel/                     # Panel administrativo
│   ├── page.tsx              # Dashboard admin
│   ├── login/page.tsx        # Login admin
│   ├── products/page.tsx     # CRUD productos
│   ├── categories/page.tsx   # CRUD categorías/subcategorías
│   ├── orders/page.tsx       # Gestión pedidos
│   ├── users/page.tsx        # Gestión usuarios cliente
│   ├── admin-users/page.tsx  # CRUD usuarios admin internos
│   ├── carts/page.tsx        # Carritos abandonados
│   ├── carousel/page.tsx     # Gestión carrusel home
│   ├── ctas/page.tsx         # Gestión CTAs
│   ├── home-categories/page.tsx  # Categorías destacadas home
│   ├── legal-content/page.tsx    # Editor contenido legal
│   ├── branding/page.tsx         # Configuración de branding
│   └── contact/page.tsx          # Información de contacto
├── products/
│   ├── page.tsx              # Catálogo de productos
│   └── [id]/page.tsx         # Detalle de producto
├── cart/page.tsx             # Página de carrito
├── checkout/
│   ├── page.tsx              # Checkout
│   └── success/page.tsx      # Confirmación de orden
├── favorites/page.tsx        # Lista de favoritos
├── orders/page.tsx           # Mis pedidos
├── profile/page.tsx          # Perfil de usuario
├── search/page.tsx           # Resultados de búsqueda
├── [slug]/page.tsx           # Páginas legales dinámicas
├── page.tsx                  # Home page
├── layout.tsx                # Layout principal (Header/Footer)
└── globals.css               # Estilos globales con tokens de diseño

components/
├── header.tsx                # Navbar con búsqueda y categorías
├── footer.tsx                # Footer con enlaces y redes sociales editables
├── admin-sidebar.tsx         # Sidebar del panel admin con grupos desplegables
├── panel-layout.tsx          # Wrapper para páginas del panel
├── product-card.tsx          # Card de producto reutilizable
├── hero-carousel.tsx         # Carrusel principal home
├── branding-logo.tsx         # Componente de logo reutilizable (Header/Footer/Panel)
├── scroll-to-top.tsx         # Auto-scroll en cambio de ruta
└── ui/                       # Componentes shadcn/ui

lib/
├── auth-context.tsx          # Context de autenticación cliente
├── admin-context.tsx         # Context de autenticación admin
├── cart-context.tsx          # Context global del carrito
├── favorites-context.tsx     # Context de favoritos
├── recommendations.ts        # Lógica de recomendaciones por cookies
├── products-data.ts          # Datos mock de productos
├── categories-data.ts        # Datos mock de categorías
├── admin-users-data.ts       # Usuarios admin internos
├── carousel-data.ts          # Datos del carrusel
├── ctas-data.ts              # Datos de CTAs
├── home-categories-data.ts   # Categorías destacadas
├── legal-content-data.ts     # Contenido legal
├── branding-data.ts          # Configuración de branding (Logo, Nombre)
├── contact-data.ts           # Información de contacto y redes sociales
└── orders-data.ts            # Pedidos mock
```

---

## ✅ Backend (Next.js Route Handlers + Prisma)

### Autenticación

**User**

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout
```

**Admin**

```
POST /api/admin/login
GET  /api/admin/me
POST /api/admin/refresh
POST /api/admin/logout
```

### E-commerce

```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/[productId]
DELETE /api/cart/items/[productId]

GET    /api/favorites
POST   /api/favorites/[productId]
DELETE /api/favorites/[productId]

GET    /api/orders
POST   /api/orders
GET    /api/orders/[id]
PUT    /api/orders/[id]/cancel
```

### Admin

```
GET    /api/admin/orders
GET    /api/admin/orders/[id]
PUT    /api/admin/orders/[id]/status

GET    /api/admin/carts

GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/[id]
PUT    /api/admin/products/[id]
DELETE /api/admin/products/[id]

GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/[key]
DELETE /api/admin/categories/[key]
POST   /api/admin/categories/[key]/subcategories
PUT    /api/admin/subcategories/[id]
DELETE /api/admin/subcategories/[id]

GET    /api/admin/carousel
POST   /api/admin/carousel
PUT    /api/admin/carousel/[id]
DELETE /api/admin/carousel/[id]

GET    /api/admin/ctas
POST   /api/admin/ctas
PUT    /api/admin/ctas/[id]
DELETE /api/admin/ctas/[id]

GET    /api/admin/home-categories
POST   /api/admin/home-categories
PUT    /api/admin/home-categories/[id]
DELETE /api/admin/home-categories/[id]

PUT    /api/admin/legal/[slug]
PUT    /api/admin/settings/branding
PUT    /api/admin/contact-info

GET    /api/admin/dashboard/stats
```

### Mapeo Frontend → Base de Datos

#### 1. AUTENTICACIÓN Y USUARIOS

**Frontend Actual (Mock):**
- `lib/auth-context.tsx` - Maneja login con localStorage
- `app/(auth)/login/page.tsx` - Formulario de login
- Usuario mock: `{ email, password, name }`

**Base de Datos (Por Implementar):**
- Tabla `users` - Usuarios clientes
- Tabla `admin_users` - Usuarios admin internos
- Tabla `refresh_tokens` - JWT refresh tokens

**API Requerida:**
```
POST /api/auth/register → INSERT INTO users
POST /api/auth/login → SELECT FROM users + generar JWT
POST /api/auth/refresh → UPDATE refresh_tokens
GET /api/auth/me → SELECT FROM users WHERE id = {userId}
```

**Cambios Necesarios en Frontend:**
- Reemplazar localStorage por llamadas API
- Implementar manejo de JWT (access + refresh tokens)
- Agregar manejo de interceptor de Axios para renovar tokens
- Agregar verificación de email

---

#### 2. PRODUCTOS

**Frontend Actual:**
- `lib/products-data.ts` - Array de productos mock
- `app/products/page.tsx` - Lista productos con filters client-side
- `app/products/[id]/page.tsx` - Detalle de producto
- Estructura: `{ id, name, description, price, image, category, brand, rating }`

**Base de Datos:**
- Tabla `products` - Información principal
- Tabla `product_images` - Múltiples imágenes por producto
- Tabla `categories` - Categorías y subcategorías (auto-referencia)

**API Requerida:**
```
GET /api/products?page=1&limit=20&category=electronics&minPrice=100000&sort=price_asc
  → SELECT FROM products JOIN categories WHERE...
  
GET /api/products/{id}
  → SELECT FROM products + product_images + product_reviews
  
POST /api/products (Admin)
  → INSERT INTO products + product_images
  
PUT /api/products/{id} (Admin)
  → UPDATE products SET ... WHERE id = {id}
  
DELETE /api/products/{id} (Admin)
  → DELETE FROM products WHERE id = {id}
```

**Cambios Necesarios:**
- Reemplazar array mock por fetch API con paginación server-side
- Implementar carga de múltiples imágenes
- Agregar manejo de stock en tiempo real
- Implementar búsqueda con Elasticsearch o PostgreSQL full-text search

---

#### 3. CATEGORÍAS

**Frontend Actual:**
- `lib/categories-data.ts` - Array de categorías con subcategorías
- `components/header.tsx` - Mega menú de categorías
- Estructura: `{ id, name, icon, subcategories: [] }`

**Base de Datos:**
- Tabla `categories` con `parent_id` (auto-referencia)

**API Requerida:**
```
GET /api/categories
  → SELECT FROM categories WHERE parent_id IS NULL (solo principales)
  → Incluir subcategorías en respuesta anidada
  
GET /api/categories/{id}/products
  → SELECT FROM products WHERE category_id = {id}
```

---

#### 4. CARRITO DE COMPRAS

**Frontend Actual:**
- `lib/cart-context.tsx` - Context con localStorage
- `app/cart/page.tsx` - Vista del carrito
- Estructura: `{ items: [{ product, quantity }], total }`

**Base de Datos:**
- Tabla `carts` - Un carrito por usuario/sesión
- Tabla `cart_items` - Items del carrito

**API Requerida:**
```
GET /api/cart
  → SELECT FROM carts JOIN cart_items JOIN products WHERE user_id = {userId}
  
POST /api/cart/items
  → INSERT INTO cart_items (cart_id, product_id, quantity)
  
PUT /api/cart/items/{productId}
  → UPDATE cart_items SET quantity = {quantity}
  
DELETE /api/cart/items/{productId}
  → DELETE FROM cart_items WHERE product_id = {productId}
```

**Cambios Necesarios:**
- Migrar de localStorage a base de datos
- Sincronizar carrito entre dispositivos
- Implementar carritos abandonados con emails automáticos
- Validar stock disponible antes de agregar items

---

#### 5. FAVORITOS

**Frontend Actual:**
- `lib/favorites-context.tsx` - Context con localStorage
- `app/favorites/page.tsx` - Lista de favoritos
- Estructura: Array de IDs de productos

**Base de Datos:**
- Tabla `favorites` - Relación user_id + product_id

**API Requerida:**
```
GET /api/favorites
  → SELECT products.* FROM favorites JOIN products WHERE user_id = {userId}
  
POST /api/favorites/{productId}
  → INSERT INTO favorites (user_id, product_id)
  
DELETE /api/favorites/{productId}
  → DELETE FROM favorites WHERE user_id = {userId} AND product_id = {productId}
```

---

#### 6. ÓRDENES (PEDIDOS)

**Frontend Actual:**
- `lib/orders-data.ts` - Órdenes mock
- `app/orders/page.tsx` - Lista de pedidos del usuario
- `app/checkout/page.tsx` - Formulario de checkout
- Estructura: `{ id, orderNumber, items, total, status, date }`

**Base de Datos:**
- Tabla `orders` - Información principal de la orden
- Tabla `order_items` - Items de la orden (snapshot)
- Tabla `order_status_history` - Historial de cambios de estado
- Tabla `user_addresses` - Direcciones de envío

**API Requerida:**
```
POST /api/orders
  → BEGIN TRANSACTION
  → INSERT INTO orders
  → INSERT INTO order_items (snapshot del producto)
  → DELETE FROM cart_items WHERE cart_id = {cartId}
  → UPDATE products SET stock_quantity = stock_quantity - {quantity}
  → COMMIT
  
GET /api/orders
  → SELECT FROM orders WHERE user_id = {userId}
  
GET /api/orders/{id}
  → SELECT FROM orders JOIN order_items WHERE order_id = {id}
  
PUT /api/orders/{id}/cancel (Usuario)
  → UPDATE orders SET status = 'cancelled'
  
PUT /api/orders/{id}/status (Admin)
  → UPDATE orders SET status = {newStatus}
  → INSERT INTO order_status_history
```

**Cambios Necesarios:**
- Implementar integración con pasarelas de pago (Pagopar/Bancard)
- Agregar webhooks para confirmación de pago
- Enviar emails de confirmación y seguimiento
- Implementar cálculo de envío dinámico según peso/dimensiones

---

#### 7. PANEL DE ADMINISTRACIÓN

**Frontend Actual:**
- Todas las páginas bajo `app/panel/`
- `lib/admin-context.tsx` - Autenticación admin con localStorage
- `components/admin-sidebar.tsx` - Navegación del panel
- CRUD completo de todas las entidades

**Base de Datos:**
- Tabla `admin_users` - Usuarios internos del panel
- Tabla `admin_activity_logs` - Log de todas las acciones

**APIs Requerida:**
```
POST /api/admin/login
  → SELECT FROM admin_users WHERE username = {username}
  → Verificar password con bcrypt
  → Generar JWT con permisos incluidos
  
GET /api/admin/dashboard/stats
  → Múltiples queries para métricas
  
[Todas las APIs de productos, categorías, órdenes, etc. con permisos de admin]
```

**Cambios Necesarios:**
- Implementar sistema de permisos granulares
- Agregar logs de auditoría en cada acción
- Crear dashboard con gráficos (Chart.js o Recharts)
- Implementar exportación de datos (CSV, Excel)

---

#### 8. CONTENIDO DINÁMICO (Carrusel, CTAs, Categorías Home)

**Frontend Actual:**
- `lib/carousel-data.ts` - Slides del carrusel
- `lib/ctas-data.ts` - CTAs de la home
- `lib/home-categories-data.ts` - Categorías destacadas
- Componentes: `hero-carousel.tsx`, CTAs en `app/page.tsx`

**Base de Datos:**
- Tabla `carousel_slides`
- Tabla `ctas`
- Tabla `home_categories`

**APIs Requerida:**
```
GET /api/content/carousel
  → SELECT FROM carousel_slides WHERE is_active = TRUE ORDER BY display_order
  
GET /api/content/ctas
  → SELECT FROM ctas WHERE is_active = TRUE ORDER BY display_order
  
GET /api/content/home-categories
  → SELECT FROM home_categories WHERE is_active = TRUE ORDER BY display_order
  
POST /api/admin/content/carousel (Admin)
  → INSERT INTO carousel_slides
  
PUT /api/admin/content/carousel/{id} (Admin)
  → UPDATE carousel_slides
```

---

#### 9. BÚSQUEDA Y RECOMENDACIONES

**Frontend Actual:**
- `app/search/page.tsx` - Búsqueda client-side
- `lib/recommendations.ts` - Recomendaciones por cookies
- Estructura: Filtrado de array de productos mock

**Base de Datos:**
- Tabla `user_product_views` - Historial de navegación
- Tabla `products` con índices full-text

**APIs Requerida:**
```
GET /api/search?q={query}&filters={...}
  → SELECT FROM products WHERE 
    to_tsvector('spanish', name || ' ' || description) 
    @@ plainto_tsquery('spanish', {query})
  
GET /api/products/recommended
  → Algoritmo basado en:
    - user_product_views (productos vistos)
    - order_items (productos comprados)
    - Productos de misma categoría
    - Productos frecuentemente comprados juntos
  
POST /api/products/{id}/view
  → INSERT INTO user_product_views (user_id, product_id)
```

---

#### 10. CONTENIDO LEGAL

**Frontend Actual:**
- `lib/legal-content-data.ts` - Markdown de términos, privacidad, etc.
- `app/[slug]/page.tsx` - Renderiza páginas dinámicas
- `app/panel/legal-content/page.tsx` - Editor de contenido

**Base de Datos:**
- Tabla `legal_content` - Contenido en markdown o HTML

**APIs Requerida:**
```
GET /api/legal/{slug}
  → SELECT FROM legal_content WHERE slug = {slug}
  
PUT /api/admin/legal/{slug} (Admin)
  → UPDATE legal_content SET content = {content}
```

---

#### 11. BRANDING Y CONFIGURACIÓN GENERAL

**Frontend Actual:**
- `lib/branding-data.ts` - Datos mock de logo y nombre
- `components/branding-logo.tsx` - Componente reutilizable

**Base de Datos:**
- Tabla `settings` o `branding` (clave-valor)

**API Requerida:**
```
GET /api/settings/branding
  → SELECT logo_url, site_name FROM settings WHERE id = 1
  
PUT /api/admin/settings/branding (Admin)
  → UPDATE settings SET logo_url = ..., site_name = ... WHERE id = 1
```

---

#### 12. INFORMACIÓN DE CONTACTO Y REDES SOCIALES

**Frontend Actual:**
- `lib/contact-data.ts` - Datos mock de contacto y redes sociales
- `components/footer.tsx` - Muestra información de contacto y enlaces a redes sociales

**Base de Datos:**
- Tabla `contact_info`

**API Requerida:**
```
GET /api/contact-info
  → SELECT * FROM contact_info WHERE id = 1
  
PUT /api/admin/contact-info (Admin)
  → UPDATE contact_info SET ... WHERE id = 1
```

---

### Resumen de Migración

**Cambios Globales Necesarios:**

1. **Instalar dependencias:**
```bash
npm install axios swr
npm install @tanstack/react-query  # Para cache y refetch automático
```

2. **Crear cliente API centralizado:**
```typescript
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor para agregar JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar token expirado
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Renovar token y reintentar
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

3. **Migrar cada Context a usar APIs:**
- Reemplazar estados locales por llamadas API
- Usar SWR o React Query para cache y revalidación
- Mantener optimistic updates para mejor UX

4. **Agregar variables de entorno:**
```env
NEXT_PUBLIC_API_URL=https://api.techzone.com.py
NEXT_PUBLIC_STRIPE_KEY=pk_...
```

---

## 📋 ESPECIFICACIONES BACKEND (Por Implementar)

### Stack Tecnológico Recomendado

**Backend:**
- Node.js 20+ con Express.js o NestJS
- TypeScript para type-safety
- Base de datos: **PostgreSQL 15+** (SQL normalizado)
- ORM: **Prisma** (recomendado) o TypeORM
- Autenticación: **JWT** + **bcrypt**
- Caché: Redis para sesiones y rate limiting
- Storage: **AWS S3** o **Cloudinary** para imágenes
- Email: **SendGrid**, **AWS SES** o **Mailgun**
- Pagos Paraguay: **Pagopar**, **Bancard** o **Stripe** (internacional)
- Queue: **Bull** con Redis para procesamiento asíncrono

**Infraestructura:**
- Docker para containerización
- Nginx como reverse proxy
- PM2 para process management
- CI/CD: GitHub Actions o GitLab CI

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS SQL (PostgreSQL)

### Esquema Completo Normalizado (3NF)

```sql
-- ============================================
-- USUARIOS Y AUTENTICACIÓN
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin'
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- DIRECCIONES DE USUARIOS
-- ============================================

CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_type VARCHAR(20) DEFAULT 'shipping', -- 'shipping', 'billing'
  full_name VARCHAR(200) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL, -- Departamento en Paraguay
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'PY', -- ISO code
  phone VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON user_addresses(user_id);

-- ============================================
-- USUARIOS ADMIN INTERNOS
-- ============================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'superadmin', 'admin', 'editor', 'viewer'
  permissions JSONB DEFAULT '[]', -- Array de permisos ['products', 'orders', etc.]
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- ============================================
-- CATEGORÍAS Y SUBCATEGORÍAS
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- PRODUCTOS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(50),
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(12,2) CHECK (compare_at_price >= price),
  cost_price DECIMAL(12,2) CHECK (cost_price >= 0), -- Solo admin
  currency VARCHAR(3) DEFAULT 'PYG', -- Guaraníes paraguayos
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT DEFAULT 10,
  weight_kg DECIMAL(8,3), -- Para cálculo de envío
  length_cm DECIMAL(8,2),
  width_cm DECIMAL(8,2),
  height_cm DECIMAL(8,2),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  purchase_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title VARCHAR(200),
  seo_description VARCHAR(300),
  tags TEXT[], -- Array de tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- ============================================
-- IMÁGENES DE PRODUCTOS
-- ============================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================
-- CARRITOS
-- ============================================

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- Para usuarios no autenticados
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_addition DECIMAL(12,2) NOT NULL, -- Precio cuando se agregó
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ============================================
-- ÓRDENES (PEDIDOS)
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- ORD-20260104-001
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Montos
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PYG',
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pending', 
    -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  payment_status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'paid', 'failed', 'refunded'
  payment_method VARCHAR(50), -- 'pagopar', 'bancard', 'credit_card', 'bank_transfer'
  payment_transaction_id VARCHAR(255),
  
  -- Envío
  shipping_method VARCHAR(50), -- 'standard', 'express', 'priority'
  shipping_address_id UUID REFERENCES user_addresses(id),
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_reason TEXT
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL, -- Snapshot
  product_sku VARCHAR(100) NOT NULL, -- Snapshot
  product_image VARCHAR(500), -- Snapshot
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- HISTORIAL DE ESTADOS DE ORDEN
-- ============================================

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES admin_users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id);

-- ============================================
-- FAVORITOS
-- ============================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================
-- REVIEWS (RESEÑAS)
-- ============================================

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id), -- Para verificar compra
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id) -- Un usuario solo puede dejar una review por producto
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_user ON product_reviews(user_id);

CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

-- ============================================
-- CARRUSEL HOME
-- ============================================

CREATE TABLE carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_desktop_url VARCHAR(500) NOT NULL,
  image_mobile_url VARCHAR(500) NOT NULL,
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CTAs (Call to Actions)
-- ============================================

CREATE TABLE ctas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_desktop_url VARCHAR(500) NOT NULL,
  image_mobile_url VARCHAR(500) NOT NULL,
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  background_color VARCHAR(20),
  text_color VARCHAR(20),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CATEGORÍAS HOME (Sección destacada)
-- ============================================

CREATE TABLE home_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CONTENIDO LEGAL
-- ============================================

CREATE TABLE legal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_legal_slug ON legal_content(slug);

-- ============================================
-- BRANDING CONFIGURATION
-- ============================================

CREATE TABLE branding_settings (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  logo_desktop_url VARCHAR(500),
  logo_mobile_url VARCHAR(500),
  favicon_url VARCHAR(500),
  primary_color VARCHAR(7), -- Hex color code
  secondary_color VARCHAR(7), -- Hex color code
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CONTACT INFORMATION
-- ============================================

CREATE TABLE contact_information (
  id SERIAL PRIMARY KEY,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  working_hours TEXT,
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  twitter_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- HISTORIAL DE NAVEGACIÓN (Para Recomendaciones)
-- ============================================

CREATE TABLE user_product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- Para usuarios no autenticados
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT view_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_product_views_user ON user_product_views(user_id);
CREATE INDEX idx_product_views_session ON user_product_views(session_id);
CREATE INDEX idx_product_views_product ON user_product_views(product_id);

-- ============================================
-- TOKENS DE SESIÓN (JWT Refresh Tokens)
-- ============================================

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ============================================
-- LOGS DE ACTIVIDAD ADMIN
-- ============================================

CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'create_product', 'update_order', etc.
  entity_type VARCHAR(50), -- 'product', 'order', 'user', etc.
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_user ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_logs_created ON admin_activity_logs(created_at DESC);

-- ============================================
-- TRIGGERS Y FUNCIONES
-- ============================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branding_settings_updated_at BEFORE UPDATE ON branding_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_information_updated_at BEFORE UPDATE ON contact_information
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de orden único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter 
  FROM orders 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar rating de producto cuando se agrega review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
    review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review 
AFTER INSERT OR UPDATE OF is_approved ON product_reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Trigger para reducir stock al confirmar orden
CREATE OR REPLACE FUNCTION reduce_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE products p
    SET stock_quantity = stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reduce_stock_on_order_confirm
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION reduce_product_stock();
```

---

## 🔌 ESTRUCTURA DE APIS REST

### Base URL
```
Production: https://api.techzone.com.py
Development: http://localhost:3001
```

### 1. AUTENTICACIÓN (`/api/auth`)

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+595981123456"
}

Response 201:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { /* datos usuario */ },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer {refreshToken}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Recuperar Contraseña
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response 200:
{
  "success": true,
  "message": "Email de recuperación enviado"
}
```

#### OAuth (Google/Facebook)
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "google-id-token"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { /* datos */ },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 2. PRODUCTOS (`/api/products`)

#### Listar Productos (Paginado con Filtros)
```http
GET /api/products?page=1&limit=20&category=electronics&minPrice=100000&maxPrice=5000000&sort=price_asc&search=iphone

Response 200:
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "iPhone 15 Pro Max",
        "slug": "iphone-15-pro-max",
        "description": "...",
        "price": 8500000,
        "compareAtPrice": 9000000,
        "images": ["url1", "url2"],
        "rating": 4.8,
        "reviewCount": 124,
        "inStock": true,
        "stockQuantity": 15,
        "category": {
          "id": "uuid",
          "name": "Smartphones"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

#### Obtener Producto por ID
```http
GET /api/products/{id}

Response 200:
{
  "success": true,
  "data": {
    "product": { /* datos completos */ },
    "relatedProducts": [ /* productos relacionados */ ]
  }
}
```

#### Crear Producto (Admin)
```http
POST /api/products
Authorization: Bearer {adminAccessToken}
Content-Type: application/json

{
  "name": "Nuevo Producto",
  "slug": "nuevo-producto",
  "description": "Descripción...",
  "categoryId": "uuid",
  "brand": "Samsung",
  "sku": "SAM-GX-001",
  "price": 3500000,
  "compareAtPrice": 4000000,
  "costPrice": 2800000,
  "stockQuantity": 50,
  "images": ["url1", "url2"],
  "weight": 0.5,
  "dimensions": {
    "length": 15,
    "width": 8,
    "height": 1
  }
}

Response 201:
{
  "success": true,
  "data": {
    "product": { /* producto creado */ }
  }
}
```

#### Actualizar Producto (Admin)
```http
PUT /api/products/{id}
Authorization: Bearer {adminAccessToken}

(mismo body que crear)

Response 200:
{
  "success": true,
  "data": {
    "product": { /* producto actualizado */ }
  }
}
```

#### Eliminar Producto (Admin)
```http
DELETE /api/products/{id}
Authorization: Bearer {adminAccessToken}

Response 204: No Content
```

#### Productos Destacados
```http
GET /api/products/featured?limit=8

Response 200:
{
  "success": true,
  "data": {
    "products": [ /* productos destacados */ ]
  }
}
```

#### Últimos Productos
```http
GET /api/products/latest?limit=10

Response 200:
{
  "success": true,
  "data": {
    "products": [ /* últimos agregados */ ]
  }
}
```

#### Productos Recomendados
```http
GET /api/products/recommended
Authorization: Bearer {accessToken} (opcional)

Response 200:
{
  "success": true,
  "data": {
    "products": [ /* recomendados según historial */ ]
  }
}
```

### 3. CATEGORÍAS (`/api/categories`)

#### Listar Categorías
```http
GET /api/categories

Response 200:
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Electrónica",
        "slug": "electronica",
        "image": "url",
        "subcategories": [
          {
            "id": "uuid",
            "name": "Smartphones",
            "slug": "smartphones"
          }
        ]
      }
    ]
  }
}
```

#### Crear Categoría (Admin)
```http
POST /api/categories
Authorization: Bearer {adminAccessToken}

{
  "name": "Nueva Categoría",
  "slug": "nueva-categoria",
  "description": "...",
  "parentId": "uuid o null",
  "image": "url"
}

Response 201:
{
  "success": true,
  "data": {
    "category": { /* categoría creada */ }
  }
}
```

### 4. CARRITO (`/api/cart`)

#### Obtener Carrito
```http
GET /api/cart
Authorization: Bearer {accessToken} (o session_id en cookies)

Response 200:
{
  "success": true,
  "data": {
    "cart": {
      "id": "uuid",
      "items": [
        {
          "id": "uuid",
          "product": {
            "id": "uuid",
            "name": "iPhone 15",
            "price": 8500000,
            "image": "url"
          },
          "quantity": 2,
          "subtotal": 17000000
        }
      ],
      "subtotal": 17000000,
      "itemCount": 2
    }
  }
}
```

#### Agregar Item al Carrito
```http
POST /api/cart/items
Authorization: Bearer {accessToken} (o session_id)

{
  "productId": "uuid",
  "quantity": 1
}

Response 201:
{
  "success": true,
  "data": {
    "cart": { /* carrito actualizado */ }
  }
}
```

#### Actualizar Cantidad
```http
PUT /api/cart/items/{productId}
Authorization: Bearer {accessToken}

{
  "quantity": 3
}

Response 200:
{
  "success": true,
  "data": {
    "cart": { /* carrito actualizado */ }
  }
}
```

#### Eliminar Item
```http
DELETE /api/cart/items/{productId}
Authorization: Bearer {accessToken}

Response 204: No Content
```

#### Vaciar Carrito
```http
DELETE /api/cart
Authorization: Bearer {accessToken}

Response 204: No Content
```

### 5. ÓRDENES (`/api/orders`)

#### Crear Orden (Checkout)
```http
POST /api/orders
Authorization: Bearer {accessToken}

{
  "shippingAddressId": "uuid",
  "shippingMethod": "express",
  "paymentMethod": "pagopar",
  "customerNotes": "Entregar por la tarde"
}

Response 201:
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-20260104-001",
      "total": 17250000,
      "status": "pending",
      "paymentIntentId": "pagopar_intent_xxx" // Para completar pago
    }
  }
}
```

#### Listar Mis Órdenes
```http
GET /api/orders
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "ORD-20260104-001",
        "total": 17250000,
        "status": "shipped",
        "createdAt": "2026-01-04T10:00:00Z",
        "itemCount": 3
      }
    ]
  }
}
```

#### Obtener Detalle de Orden
```http
GET /api/orders/{id}
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-20260104-001",
      "status": "shipped",
      "paymentStatus": "paid",
      "items": [ /* items */ ],
      "shippingAddress": { /* dirección */ },
      "trackingNumber": "TRACK123456",
      "subtotal": 17000000,
      "shippingCost": 50000,
      "tax": 200000,
      "total": 17250000,
      "createdAt": "...",
      "shippedAt": "..."
    }
  }
}
```

#### Actualizar Estado de Orden (Admin)
```http
PUT /api/orders/{id}/status
Authorization: Bearer {adminAccessToken}

{
  "status": "shipped",
  "notes": "Despachado con Correo Paraguayo"
}

Response 200:
{
  "success": true,
  "data": {
    "order": { /* orden actualizada */ }
  }
}
```

#### Agregar Tracking (Admin)
```http
PUT /api/orders/{id}/tracking
Authorization: Bearer {adminAccessToken}

{
  "trackingNumber": "TRACK123456"
}

Response 200:
{
  "success": true,
  "data": {
    "order": { /* orden actualizada */ }
  }
}
```

#### Cancelar Orden
```http
DELETE /api/orders/{id}/cancel
Authorization: Bearer {accessToken}

{
  "reason": "Cambié de opinión"
}

Response 200:
{
  "success": true,
  "message": "Orden cancelada exitosamente"
}
```

### 6. FAVORITOS (`/api/favorites`)

#### Listar Mis Favoritos
```http
GET /api/favorites
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "uuid",
        "product": { /* datos producto */ },
        "createdAt": "..."
      }
    ]
  }
}
```

#### Agregar a Favoritos
```http
POST /api/favorites/{productId}
Authorization: Bearer {accessToken}

Response 201:
{
  "success": true,
  "message": "Producto agregado a favoritos"
}
```

#### Eliminar de Favoritos
```http
DELETE /api/favorites/{productId}
Authorization: Bearer {accessToken}

Response 204: No Content
```

### 7. BÚSQUEDA (`/api/search`)

#### Búsqueda General
```http
GET /api/search?q=iphone&category=electronics&minPrice=1000000&maxPrice=10000000&sort=price_asc&page=1&limit=20

Response 200:
{
  "success": true,
  "data": {
    "results": [ /* productos */ ],
    "pagination": { /* paginación */ },
    "facets": {
      "categories": [
        { "name": "Smartphones", "count": 45 }
      ],
      "brands": [
        { "name": "Apple", "count": 23 }
      ],
      "priceRanges": [
        { "range": "0-2000000", "count": 12 }
      ]
    }
  }
}
```

#### Sugerencias de Búsqueda
```http
GET /api/search/suggestions?q=ipho

Response 200:
{
  "success": true,
  "data": {
    "suggestions": [
      "iphone 15",
      "iphone 14 pro",
      "iphone 13"
    ]
  }
}
```

### 8. REVIEWS (`/api/reviews`)

#### Listar Reviews de Producto
```http
GET /api/products/{productId}/reviews?page=1&limit=10&sort=recent

Response 200:
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "user": {
          "firstName": "Juan",
          "lastName": "P." // Parcial
        },
        "rating": 5,
        "title": "Excelente producto",
        "comment": "...",
        "isVerifiedPurchase": true,
        "helpfulCount": 12,
        "createdAt": "..."
      }
    ],
    "summary": {
      "averageRating": 4.6,
      "totalReviews": 245,
      "ratingDistribution": {
        "5": 180,
        "4": 40,
        "3": 15,
        "2": 5,
        "1": 5
      }
    }
  }
}
```

#### Crear Review
```http
POST /api/products/{productId}/reviews
Authorization: Bearer {accessToken}

{
  "rating": 5,
  "title": "Excelente",
  "comment": "Muy satisfecho con la compra..."
}

Response 201:
{
  "success": true,
  "data": {
    "review": { /* review creada */ }
  }
}
```

#### Marcar Review como Útil
```http
POST /api/reviews/{reviewId}/helpful
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Voto registrado"
}
```

### 9. PANEL ADMIN (`/api/admin`)

#### Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer {adminAccessToken}

Response 200:
{
  "success": true,
  "data": {
    "stats": {
      "totalRevenue": 125000000,
      "totalOrders": 1234,
      "totalVisits": 45678,
      "newCustomers": 156,
      "revenueGrowth": 12.5,
      "ordersGrowth": 8.3
    }
  }
}
```

#### Listar Todos los Pedidos (Admin)
```http
GET /api/admin/orders?page=1&limit=20&status=pending&startDate=2026-01-01&endDate=2026-01-31

Response 200:
{
  "success": true,
  "data": {
    "orders": [ /* todas las órdenes */ ],
    "pagination": { /* paginación */ }
  }
}
```

#### Listar Usuarios (Admin)
```http
GET /api/admin/users?page=1&limit=20&search=juan

Response 200:
{
  "success": true,
  "data": {
    "users": [ /* usuarios */ ],
    "pagination": { /* paginación */ }
  }
}
```

#### Carritos Abandonados (Admin)
```http
GET /api/admin/carts/abandoned?days=7

Response 200:
{
  "success": true,
  "data": {
    "carts": [
      {
        "id": "uuid",
        "user": { /* datos usuario */ },
        "items": [ /* items */ ],
        "total": 5000000,
        "abandonedAt": "...",
        "daysSinceAbandoned": 3
      }
    ]
  }
}
```

#### CRUD Carrusel
```http
GET    /api/admin/carousel
POST   /api/admin/carousel
PUT    /api/admin/carousel/{id}
DELETE /api/admin/carousel/{id}
PUT    /api/admin/carousel/reorder

(Estructura similar a productos)
```

#### CRUD CTAs
```http
GET    /api/admin/ctas
POST   /api/admin/ctas
PUT    /api/admin/ctas/{id}
DELETE /api/admin/ctas/{id}
```

#### CRUD Contenido Legal
```http
GET    /api/admin/legal-content
GET    /api/admin/legal-content/{slug}
PUT    /api/admin/legal-content/{slug}
```

#### CRUD Usuarios Admin Internos
```http
GET    /api/admin/admin-users
POST   /api/admin/admin-users
PUT    /api/admin/admin-users/{id}
DELETE /api/admin/admin-users/{id}
PUT    /api/admin/admin-users/{id}/permissions
```

#### CRUD Branding
```http
GET    /api/admin/branding
PUT    /api/admin/branding

(Body para PUT: { site_name, logo_desktop_url, logo_mobile_url, ... })
```

#### CRUD Información de Contacto
```http
GET    /api/admin/contact-info
PUT    /api/admin/contact-info

(Body para PUT: { address, phone, email, working_hours, facebook_url, ... })
```

### 10. PAGOS PARAGUAY (`/api/payments`)

#### Crear Intención de Pago (Pagopar/Bancard)
```http
POST /api/payments/create-intent
Authorization: Bearer {accessToken}

{
  "orderId": "uuid",
  "provider": "pagopar", // o "bancard"
  "returnUrl": "https://techzone.com.py/checkout/success"
}

Response 200:
{
  "success": true,
  "data": {
    "paymentIntentId": "pagopar_xxx",
    "redirectUrl": "https://pagopar.com.py/checkout/xxx",
    "expiresAt": "2026-01-04T12:00:00Z"
  }
}
```

#### Confirmar Pago
```http
POST /api/payments/confirm
Authorization: Bearer {accessToken}

{
  "paymentIntentId": "pagopar_xxx",
  "transactionId": "TRX123456"
}

Response 200:
{
  "success": true,
  "data": {
    "order": { /* orden actualizada con pago confirmado */ }
  }
}
```

#### Webhook de Pagopar/Bancard
```http
POST /api/webhooks/pagopar
X-Signature: {firma_hmac}

{
  "transactionId": "TRX123456",
  "status": "approved",
  "amount": 17250000,
  "orderId": "uuid"
}

Response 200:
{
  "received": true
}
```

### 11. UPLOAD DE IMÁGENES (`/api/upload`)

#### Subir Imagen
```http
POST /api/upload/image
Authorization: Bearer {adminAccessToken}
Content-Type: multipart/form-data

{
  "image": File,
  "folder": "products" // o "carousel", "categories", etc.
}

Response 200:
{
  "success": true,
  "data": {
    "url": "https://cdn.techzone.com.py/products/image123.jpg",
    "thumbnailUrl": "https://cdn.techzone.com.py/products/thumb_image123.jpg"
  }
}
```

---

## 🔒 SEGURIDAD Y CIBERSEGURIDAD

### 1. Autenticación JWT

**Implementación:**
```javascript
// Generar tokens
const accessToken = jwt.sign(
  { userId, role, email },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { userId },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);

// Almacenar refresh token hasheado en BD
// Enviar ambos tokens al cliente
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Cookies (Alternativa más segura):**
```javascript
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true, // Solo HTTPS
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 min
});
```

### 2. Hashing de Contraseñas

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Al registrar
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

// Al login
const isValid = await bcrypt.compare(password, user.passwordHash);
```

**Reglas de contraseñas:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número
- Al menos 1 carácter especial
- No usar contraseñas comunes (diccionario)

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Rate limit general
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: 'Demasiadas solicitudes, intenta más tarde'
});

// Rate limit para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  skipSuccessfulRequests: true,
  message: 'Demasiados intentos de login'
});

// Rate limit para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros
  message: 'Demasiados registros desde esta IP'
});

// Rate limit para uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads
  message: 'Límite de uploads alcanzado'
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/upload', uploadLimiter);
```

### 4. Validación de Inputs

```javascript
const { body, param, query, validationResult } = require('express-validator');

// Ejemplo middleware de validación
const validateProduct = [
  body('name').trim().isLength({ min: 3, max: 255 }).escape(),
  body('price').isFloat({ min: 0 }),
  body('email').isEmail().normalizeEmail(),
  body('sku').matches(/^[A-Z0-9-]+$/),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 5. SQL Injection Prevention

**Usar ORM/Query Builder (Prisma recomendado):**
```javascript
// ✅ CORRECTO - Con Prisma
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// ❌ INCORRECTO - SQL raw vulnerable
const user = await db.query(`SELECT * FROM users WHERE email = '${userEmail}'`);

// ✅ CORRECTO - Si usas SQL raw, usa placeholders
const user = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
```

### 6. XSS Prevention

```javascript
// Sanitizar HTML
const sanitizeHtml = require('sanitize-html');

const cleanHtml = sanitizeHtml(userInput, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    'a': ['href']
  }
});

// En el frontend, usar escapado automático
// React escapa automáticamente con {}
// Evitar dangerouslySetInnerHTML a menos que sea necesario
```

### 7. CSRF Protection

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// En cada form, incluir token CSRF
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### 8. CORS Configuración

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://techzone.com.py',
    'https://www.techzone.com.py',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 9. Headers de Seguridad (Helmet)

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://cdn.techzone.com.py"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 10. Logs de Seguridad

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Log eventos de seguridad
logger.warn('Failed login attempt', {
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date()
});

logger.info('Admin action', {
  adminId: req.user.id,
  action: 'delete_product',
  productId: req.params.id
});
```

### 11. Protección de Archivos Upload

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Solo imágenes
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
  }
});
```

### 12. Variables de Entorno Seguras

```bash
# .env (NUNCA commitear este archivo)
DATABASE_URL="postgresql://user:password@localhost:5432/techzone"
JWT_SECRET="claveSecretaMuySegura123!@#RandomCompleja"
JWT_REFRESH_SECRET="otraClaveDistintaParaRefresh456$%^"
ENCRYPTION_KEY="32bytesRandomKey123456789012345"

# Usar en código
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
```

### 13. Prevención de Enumeración de Usuarios

```javascript
// ❌ MAL - Revela si el email existe
if (!user) {
  return res.status(404).json({ error: 'Usuario no encontrado' });
}
if (!validPassword) {
  return res.status(401).json({ error: 'Contraseña incorrecta' });
}

// ✅ BIEN - Mensaje genérico
if (!user || !validPassword) {
  return res.status(401).json({ error: 'Email o contraseña incorrectos' });
}
```

### 14. Expiración de Sesiones

```javascript
// Limpiar refresh tokens expirados (cronjob diario)
const cleanExpiredTokens = async () => {
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revoked: true }
      ]
    }
  });
};

// Limpiar carritos abandonados (cronjob diario)
const cleanAbandonedCarts = async () => {
  await prisma.cart.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
};
```

### 15. 2FA (Two-Factor Authentication) - Opcional

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generar secret para 2FA
const secret = speakeasy.generateSecret({
  name: `TechZone (${user.email})`
});

// Guardar secret en BD
await prisma.user.update({
  where: { id: user.id },
  data: { twoFactorSecret: secret.base32 }
});

// Generar QR para Google Authenticator
const qrCode = await QRCode.toDataURL(secret.otpauth_url);

// Verificar código 2FA
const verified = speakeasy.totp.verify({
  secret: user.twoFactorSecret,
  encoding: 'base32',
  token: req.body.token
});
```

---

## 🚧 FUNCIONALIDADES PENDIENTES

### Frontend

#### Alta Prioridad
- [ ] Integración con APIs del backend (reemplazar datos mock)
- [ ] Manejo de errores global con toast notifications
- [ ] Loading states en todas las operaciones asíncronas
- [ ] Validación de formularios mejorada (react-hook-form + zod)
- [ ] Paginación infinita o "Load More" en listados
- [ ] Optimización de imágenes (next/image, lazy loading)
- [ ] SEO completo (metadata dinámica, sitemap, robots.txt)
- [ ] Analytics (Google Analytics 4, Meta Pixel)
- [ ] Estado global con Zustand o Context API optimizado
- [ ] Internacionalización (i18n) para español/guaraní

#### Media Prioridad
- [ ] PWA (Progressive Web App) con service workers
- [ ] Notificaciones push
- [ ] Chat de soporte en vivo (Crisp, Intercom, o Tawk.to)
- [ ] Sistema de cupones y descuentos
- [ ] Wishlist compartible
- [ ] Comparador de productos
- [ ] Calculadora de cuotas para financiación
- [ ] Sistema de afiliados/referidos
- [ ] Blog integrado
- [ ] Newsletter signup

#### Baja Prioridad
- [ ] Tema oscuro/claro
- [ ] Accesibilidad mejorada (ARIA, navegación por teclado)
- [ ] Tests E2E con Playwright o Cypress
- [ ] Storybook para componentes UI
- [ ] Performance optimizations (code splitting, lazy loading)

### Backend

#### Alta Prioridad
- [ ] **Implementar TODAS las APIs listadas arriba**
- [ ] Sistema de autenticación completo con JWT
- [ ] CRUD completo de productos con imágenes
- [ ] Sistema de órdenes y checkout
- [ ] Integración con pasarelas de pago (Pagopar/Bancard)
- [ ] Sistema de emails transaccionales
- [ ] Gestión de stock en tiempo real
- [ ] Sistema de búsqueda con Elasticsearch o PostgreSQL Full-Text
- [ ] Rate limiting y seguridad
- [ ] Logging y monitoreo (Winston + Sentry)
- [ ] Backup automático de base de datos

#### Media Prioridad
- [ ] Sistema de notificaciones (email, SMS, push)
- [ ] Procesamiento de imágenes (resize, optimize) con Sharp
- [ ] Sistema de cupones y promociones
- [ ] Cálculo automático de envíos por zona
- [ ] Sistema de devoluciones y reembolsos
- [ ] Reportes y analytics del admin
- [ ] Exportación de datos (Excel, CSV, PDF)
- [ ] API de tracking de envíos
- [ ] Integración con ERP/CRM
- [ ] Multi-tenant para múltiples tiendas

#### Baja Prioridad
- [ ] Machine Learning para recomendaciones
- [ ] Chatbot con IA para soporte
- [ ] Sistema de lealtad y puntos
- [ ] API pública para desarrolladores
- [ ] GraphQL API (alternativa a REST)
- [ ] WebSockets para updates en tiempo real

### DevOps & Infraestructura

- [ ] Docker Compose para desarrollo
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deployment automatizado a producción
- [ ] Configurar CDN (Cloudflare)
- [ ] SSL/TLS certificates (Let's Encrypt)
- [ ] Monitoring (New Relic, Datadog)
- [ ] Alertas automáticas (PagerDuty, Opsgenie)
- [ ] Backups automatizados
- [ ] Disaster recovery plan
- [ ] Load balancing
- [ ] Auto-scaling

### Integraciones Externas (Paraguay)

- [ ] **Pagopar** - Pasarela de pagos local
- [ ] **Bancard** - Pasarela de pagos local
- [ ] **Correo Paraguayo** - API de envíos
- [ ] **SET (Impuestos)** - Facturación electrónica
- [ ] **SIFEN** - Sistema integrado de facturación
- [ ] **WhatsApp Business API** - Notificaciones
- [ ] **SMS Paraguay** - Notificaciones SMS

### Testing

- [ ] Unit tests backend (Jest)
- [ ] Integration tests backend (Supertest)
- [ ] E2E tests frontend (Playwright/Cypress)
- [ ] Load testing (K6, Artillery)
- [ ] Security testing (OWASP ZAP)
- [ ] Coverage mínimo 80%

### Documentación

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Guía de instalación para desarrolladores
- [ ] Guía de contribución
- [ ] Manual de usuario admin
- [ ] Diagramas de arquitectura
- [ ] Runbooks para operaciones

---

## 📞 CONTACTO Y SOPORTE

Para dudas sobre implementación del backend, contactar al equipo de desarrollo.

**Credenciales Demo:**

**Panel Admin:** `/panel/login`
- Usuario: `admin`
- Contraseña: `admin123`

**Cliente:** `/login`
- Email: `customer@techzone.com`
- Contraseña: `customer123`

---

## 📄 LICENCIA

Propietario - TechZone Paraguay © 2026
