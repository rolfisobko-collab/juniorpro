export function curateFeaturedProducts(products: any[], limit: number): any[] {
  const nameOf = (p: any) => String(p.name || "").toLowerCase()

  const bucket = (p: any): string => {
    const name = nameOf(p)
    if (name.includes("robot vacuum") || name.includes("aspirador robot") || name.includes("roborock") || name.includes("roomba") || (name.includes("xiaomi") && name.includes("robot"))) return "robot_vacuum"
    if (name.includes("macbook") || name.includes("notebook") || name.startsWith("nb ") || name.includes(" laptop")) return "laptop"
    if (name.includes("ipad") || name.includes("tablet")) return "tablet"
    if (name.includes("iphone") || (name.includes("galaxy") && (name.includes("s2") || name.includes("ultra") || name.includes("fold") || name.includes("flip")))) return "phone"
    if (name.includes("playstation") || name.includes("ps5") || name.includes("xbox") || name.includes("nintendo") || name.includes("game ")) return "console"
    if (name.includes("apple watch ultra") || name.includes("galaxy watch ultra")) return "watch"
    if (name.includes(" tv ") || name.startsWith("tv ") || name.includes("oled") || name.includes("qled") || name.includes("google tv")) return "tv"
    if (name.includes("airpods max") || name.includes("sony wh-1000xm")) return "audio"
    if (name.includes("ar condicionado") || name.includes("aspirador") || name.includes("cafeteira")) return "smart_home"
    return "other"
  }

  const scored = products.filter(hasUsableProductImage).map((p) => {
    const name = nameOf(p)
    let score = 0

    score += 100

    const price = Number(p.price) || 0
    score += Math.log10(Math.max(price, 1)) * 120

    const rating = Number(p.rating) || 0
    const reviews = Number(p.reviews) || 0
    score += rating * 10 + Math.log1p(reviews) * 5

    if (p.inStock || Number(p.stockQuantity) > 0) score += 50

    if (name.includes("iphone")) score += 80
    if (name.includes("pro max") || name.includes("promax")) score += 250
    if (name.includes("galaxy") && (name.includes("s2") || name.includes("ultra"))) score += 300
    if (name.includes("galaxy z") || name.includes("fold") || name.includes("flip")) score += 350
    if (name.includes("macbook")) score += 350
    if (name.includes("ipad") && name.includes("pro")) score += 280
    if (name.includes("notebook") || name.startsWith("nb ")) score += 260
    if (name.includes("robot vacuum") || name.includes("aspirador robot") || name.includes("roborock") || name.includes("roomba")) score += 900
    if (name.includes("playstation") || name.includes("ps5")) score += 520
    if (name.includes("xbox") || name.includes("nintendo")) score += 420
    if (name.includes("apple watch ultra") || name.includes("galaxy watch ultra")) score += 250
    if (name.includes("oled") || name.includes("qled") || name.includes("google tv")) score += 380
    if (name.includes("ar condicionado")) score += 260
    if (name.includes("airpods max") || name.includes("sony wh-1000xm")) score += 150
    if (name.includes("ultra")) score += 100
    if (name.includes("pro") && (name.includes("notebook") || name.includes("laptop"))) score += 120

    const cheapAccessory =
      /\b(cable|funda|protector|vidrio templado|case|mica|aceite|perfume unissex|perfume generico|adaptador|soporte|cargador|carregador)\b/
    if (cheapAccessory.test(name)) score -= 600
    if (name.includes("perfume") && price < 120) score -= 500

    return { p, score, bucket: bucket(p) }
  })

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (Number(b.p.price) || 0) - (Number(a.p.price) || 0)
  })

  const limits: Record<string, number> = {
    phone: 1,
    robot_vacuum: 3,
    laptop: 3,
    tablet: 2,
    console: 2,
    watch: 1,
    tv: 2,
    audio: 1,
    smart_home: 2,
    other: 4,
  }

  const counts: Record<string, number> = {}
  const result: any[] = []
  const showcaseOrder = ["laptop", "console", "robot_vacuum", "tablet", "tv", "smart_home", "phone", "watch", "audio", "other"]

  for (const preferredBucket of showcaseOrder) {
    for (const item of scored) {
      if (item.bucket !== preferredBucket) continue
      if (result.some((product) => product.id === item.p.id)) continue

      counts[preferredBucket] = (counts[preferredBucket] || 0) + 1
      if (counts[preferredBucket] <= (limits[preferredBucket] ?? 2)) {
        result.push(item.p)
        if (result.length >= limit) return result
      }
    }
  }

  return result
}

export function hasUsableProductImage(product: any): boolean {
  const image = String(product?.image || "").trim()
  if (!image) return false
  const lower = image.toLowerCase()
  const knownBrokenSources = [
    "placeholder",
    "generic-placeholder",
    "image unavailable",
    "imagen-no-disponible",
    "no-image",
    "noimage",
    "pisces.bbystatic.com",
    "f.fcdn.app",
  ]
  return !knownBrokenSources.some((pattern) => lower.includes(pattern))
}
