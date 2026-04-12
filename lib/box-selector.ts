export interface BoxStandard {
  id: string
  name: string
  lengthCm: number
  widthCm: number
  heightCm: number
  paddingCm: number
  maxWeightKg: number
  boxWeightKg: number
  isActive: boolean
  sortOrder: number
}

export interface CartItemDimensions {
  productId: string
  quantity: number
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface BoxSelectionResult {
  box: BoxStandard
  totalContentWeightKg: number
  totalShipmentWeightKg: number // contenido + caja
  totalVolumeCm3: number
  usableVolumeCm3: number
  utilizationPct: number // % de uso del volumen útil
}

/**
 * Calcula el volumen útil interior de una caja (restando relleno en cada lado)
 */
export function usableVolume(box: BoxStandard): number {
  const l = Math.max(0, box.lengthCm - box.paddingCm * 2)
  const w = Math.max(0, box.widthCm - box.paddingCm * 2)
  const h = Math.max(0, box.heightCm - box.paddingCm * 2)
  return l * w * h
}

/**
 * Dado el carrito y las cajas disponibles, devuelve la caja más pequeña que aguante todo.
 * Si ninguna alcanza, devuelve null (usar "A convenir").
 */
export function selectBox(
  items: CartItemDimensions[],
  boxes: BoxStandard[]
): BoxSelectionResult | null {
  if (!boxes.length || !items.length) return null

  // Suma total de peso del contenido
  const totalContentWeightKg = items.reduce(
    (acc, item) => acc + item.weightKg * item.quantity,
    0
  )

  // Suma total de volumen del contenido (cada ítem × cantidad)
  const totalVolumeCm3 = items.reduce(
    (acc, item) => acc + item.lengthCm * item.widthCm * item.heightCm * item.quantity,
    0
  )

  // Filtrar cajas activas, ordenadas de menor a mayor (sortOrder, luego volumen)
  const activeSorted = boxes
    .filter((b) => b.isActive)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return usableVolume(a) - usableVolume(b)
    })

  for (const box of activeSorted) {
    const vol = usableVolume(box)
    const fitsWeight = totalContentWeightKg <= box.maxWeightKg
    const fitsVolume = totalVolumeCm3 <= vol

    if (fitsWeight && fitsVolume) {
      return {
        box,
        totalContentWeightKg,
        totalShipmentWeightKg: totalContentWeightKg + box.boxWeightKg,
        totalVolumeCm3,
        usableVolumeCm3: vol,
        utilizationPct: Math.round((totalVolumeCm3 / vol) * 100),
      }
    }
  }

  // Ninguna caja alcanza
  return null
}

/**
 * Versión server-side: carga las cajas de la DB y selecciona.
 */
export async function selectBoxFromDB(items: CartItemDimensions[]): Promise<BoxSelectionResult | null> {
  const { prisma } = await import("@/lib/db")
  const boxes = await (prisma as any).boxStandard.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }],
  }) as BoxStandard[]
  return selectBox(items, boxes)
}
