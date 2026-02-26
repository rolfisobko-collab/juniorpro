import { NextResponse } from "next/server"

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

type ImgResult = { url: string; thumb: string; title: string; width: number; height: number }

async function searchBing(query: string): Promise<ImgResult[]> {
  // Use Bing's internal JSON endpoint which returns structured image data
  const searchUrl = `https://www.bing.com/images/async?q=${encodeURIComponent(query)}&async=content&first=1&count=10&mmasync=1`
  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
      "Referer": "https://www.bing.com/",
    },
  })
  if (!res.ok) throw new Error(`Bing async returned ${res.status}`)
  const html = await res.text()

  const results: ImgResult[] = []
  const seen = new Set<string>()

  // Extract murl (media/original URL) from Bing's JSON blobs embedded in HTML
  const patterns = [
    /"murl":"(https?:[^"]+)"/g,
    /\"murl\":\"(https?:[^\"]+)\"/g,
    /m_uri\s*=\s*"([^"]+)"/g,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const rawUrl = match[1].replace(/\\u0026/g, "&").replace(/\\/g, "")
      if (!rawUrl.startsWith("http")) continue
      if (seen.has(rawUrl)) continue
      // Skip small thumbnails and non-image URLs
      if (rawUrl.includes("bing.com") || rawUrl.includes("microsoft.com")) continue
      seen.add(rawUrl)
      results.push({ url: rawUrl, thumb: rawUrl, title: "", width: 0, height: 0 })
      if (results.length >= 8) break
    }
    if (results.length >= 8) break
  }

  return results
}

async function searchDDG(query: string): Promise<ImgResult[]> {
  // Get vqd token
  const tokenRes = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
    { headers: { "User-Agent": UA, "Accept-Language": "es-419,es;q=0.9" } }
  )
  const html = await tokenRes.text()

  // Try multiple vqd patterns
  const vqd =
    html.match(/vqd="([^"]+)"/)?.[1] ||
    html.match(/vqd='([^']+)'/)?.[1] ||
    html.match(/vqd=([\d-]+)/)?.[1]

  if (!vqd) throw new Error("No vqd token")

  const imgRes = await fetch(
    `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}&p=1&f=,,,,,`,
    {
      headers: {
        "User-Agent": UA,
        "Referer": "https://duckduckgo.com/",
        "Accept": "application/json",
        "Accept-Language": "es-419,es;q=0.9",
      },
    }
  )
  if (!imgRes.ok) throw new Error(`DDG ${imgRes.status}`)
  const data = await imgRes.json()

  return (data.results ?? [])
    .slice(0, 8)
    .map((item: any) => ({
      url: item.image,          // real high-res URL from the source site
      thumb: item.image,        // use same URL, not the Bing thumbnail
      title: item.title ?? "",
      width: item.width ?? 0,
      height: item.height ?? 0,
    }))
    .filter((img: ImgResult) => img.url && !img.url.includes("bing.net") && !img.url.includes("tse"))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")?.trim()
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 })

  const errors: string[] = []

  // 1. Try DDG first (returns .image which is the real source URL)
  try {
    const images = await searchDDG(query)
    if (images.length >= 2) return NextResponse.json({ images, source: "ddg" })
  } catch (e) {
    errors.push(`DDG: ${e instanceof Error ? e.message : e}`)
  }

  // 2. Try Bing async endpoint
  try {
    const images = await searchBing(query)
    if (images.length >= 2) return NextResponse.json({ images, source: "bing" })
  } catch (e) {
    errors.push(`Bing: ${e instanceof Error ? e.message : e}`)
  }

  return NextResponse.json({ error: "No results found", details: errors }, { status: 500 })
}
