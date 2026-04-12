# 📋 Manual de Uso — Panel Admin Junior Tech Zone

> Acceso: `tudominio.com/panel/login`  
> Solo personal autorizado con usuario y contraseña asignados.

---

## 1. Acceso al panel

1. Ingresá a `/panel/login`
2. Escribí tu **usuario** y **contraseña**
3. Hacé clic en **Ingresar al panel**

Si olvidaste la contraseña, contactá al administrador principal.

---

## 2. Gestión de Pedidos (`/panel/orders`)

Esta es la página principal del día a día. Acá ves **todos los pedidos** con su estado actual.

### 2.1 Vista general de la lista

Cada fila muestra:
- **Punto de color** — estado del pedido (amarillo = pendiente, azul = preparando, violeta = enviado, verde = entregado)
- **Nombre del cliente** y código corto del pedido
- **Ciudad**, método de envío, y fecha/hora
- **Estado del pago** (Pagado / Pendiente)
- **Total** del pedido
- **Badge de estado** del pedido

### 2.2 Filtrar pedidos

Usá las **pestañas** arriba de la lista:
- `Todos` — muestra todo
- `Pendientes` — pedidos recién ingresados, sin confirmar
- `Preparando` — en preparación para despacho
- `Enviados` — despachados, en tránsito
- `Entregados` — completados
- `Cancelados` — pedidos cancelados

También podés **buscar** por nombre del cliente, email, teléfono o ciudad usando la barra de búsqueda.

El botón 🔄 (arriba a la derecha) recarga la lista desde la base de datos.

---

## 3. Procesar un pedido (paso a paso)

Hacé clic en cualquier pedido para abrir el **panel lateral de detalle**.

### Paso 1 — Verificar el pago

Si el pedido aparece con **"Pago no confirmado"** (recuadro amarillo), significa que el cliente no pagó online con Bancard — por ejemplo, eligió pagar en el local.

En ese caso:
1. Verificá que el cliente haya pagado
2. Hacé clic en el método de pago correspondiente:
   - 💵 **Efectivo** — pagó con billetes en el local
   - 🏦 **Transferencia** — pagó por transferencia bancaria
   - 💳 **Bancard** — pagó con tarjeta en el local

> ⚠️ Si el cliente pagó online (Bancard en la web), el pago ya aparece como **Pagado** automáticamente. No hace falta hacer nada.

### Paso 2 — Preparar el pedido

Cuando el pago está confirmado:
1. Reuní todos los productos del pedido (los ves listados abajo en el panel)
2. El pedido debería estar en estado **"Preparando"** — si está en "Pendiente", avanzalo con el botón azul

### Paso 3 — Despachar el pedido

Según el método de envío elegido por el cliente:

#### 🚚 AEX (envío a domicilio)
1. Generá el envío en la plataforma AEX
2. Copiá el **número de tracking** que te da AEX (ej: `AEX-12345678`)
3. Pegalo en el campo **"Tracking AEX"** del panel lateral
4. Opcionalmente escribí una nota (ej: "Paquete entregado a AEX turno tarde")
5. Hacé clic en **"Despachar pedido"** — el estado pasa a "Enviado" y se notifica al cliente por email

#### 🏠 Retiro en local
1. Cuando el cliente venga a retirar, buscá el pedido
2. Hacé clic en **"Despachar pedido"** para pasarlo a "Enviado"
3. Cuando se lo lleve, hacé clic en **"Marcar entregado"**

#### 🤝 A convenir
1. Coordiná el envío con el cliente por WhatsApp (usá el botón verde **WhatsApp** en el panel)
2. Una vez acordado y enviado, hacé clic en **"Despachar pedido"**
3. Al confirmar la entrega, hacé clic en **"Marcar entregado"**

### Paso 4 — Confirmar entrega

Cuando el pedido llegó al cliente:
1. Buscá el pedido (estará en estado "Enviado")
2. Hacé clic en **"Marcar entregado"**
3. El pedido se marca como completado ✅

---

## 4. Acciones rápidas en el panel lateral

| Acción | Cuándo usarla |
|---|---|
| 📧 Clic en el email | Abre tu cliente de correo con el email del cliente |
| 💬 WhatsApp | Abre WhatsApp con el número del cliente prellenado |
| 📋 Copiar tracking | Copia el número de tracking al portapapeles |
| ❌ Botón rojo (cancelar) | Cancela el pedido — solo si el cliente lo solicitó o hubo un error |

---

## 5. Historial del pedido

Al final del panel lateral de cada pedido hay un **historial cronológico** con todos los cambios de estado, incluyendo notas y fechas. Esto te permite rastrear todo lo que pasó con el pedido.

---

## 6. Otros módulos del panel

### Productos (`/panel/products`)
- Agregar, editar o eliminar productos
- Cambiar precio, stock, imágenes y descripción

### Categorías (`/panel/categories`)
- Crear y organizar categorías del catálogo

### Marcas (`/panel/brands`)
- Agregar marcas con logo para mostrar en la tienda

### Carritos (`/panel/carts`)
- Ver qué tienen los clientes en sus carritos (útil para recordatorios)

### Cajas de Envío (`/panel/cajas`)
- Configurar los tamaños de cajas disponibles para calcular el costo AEX

### Clientes (`/panel/users`)
- Ver listado de usuarios registrados

### Carrusel (`/panel/carousel`)
- Gestionar las imágenes del banner principal de la tienda

### Tasas de Cambio (`/panel/exchange-rates`)
- Actualizar el tipo de cambio USD/PYG que se muestra en los precios

---

## 7. Flujo completo resumido

```
Cliente compra → Pedido creado en DB (con pago Bancard = automático)
       ↓
Admin verifica pago (si fue en local, registrarlo manualmente)
       ↓
Admin prepara el pedido
       ↓
Admin despacha (AEX: con tracking / Local: sin tracking / Convenir: coordinar)
       ↓
Admin confirma entrega → Pedido completado ✅
```

---

## 8. Preguntas frecuentes

**¿Los pedidos con Bancard web aparecen como pagados automáticamente?**  
Sí. Cuando el cliente paga en la web con Bancard, el sistema crea la orden directamente con `paymentStatus: paid`. No necesitás hacer nada.

**¿Qué pasa si me equivoco al cambiar el estado?**  
Los estados van en orden: Pendiente → Preparando → Enviado → Entregado. El único estado irreversible es "Cancelado". Si necesitás revertir algo, contactá al administrador técnico.

**¿El cliente recibe emails automáticos?**  
Sí. Cuando cambiás el estado del pedido, el sistema envía un email de notificación al cliente automáticamente.

**¿Cómo sé si un pedido es AEX o retiro?**  
Mirá la columna de envío en la lista: `AEX`, `Retiro en local` o `A convenir`. También aparece en el panel lateral del pedido.

---

*Manual generado para Junior Tech Zone — Panel Admin v2*
