import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

import { requireAdminId } from "@/lib/admin-session"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dxibpzcfy",
  api_key: process.env.CLOUDINARY_API_KEY || "395575268427478",
  api_secret: process.env.CLOUDINARY_API_SECRET || "bbE8bMA7stCyME9srmYdw98m0sE",
})

const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function uploadBuffer(buffer: Buffer, folder: string) {
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })
}

export async function POST(req: Request) {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : ""
    const folder = typeof body.folder === "string" && body.folder.trim()
      ? body.folder.trim()
      : "juniorweb/products"

    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json({ error: "Invalid imageUrl" }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeout))

    if (!response.ok) {
      return NextResponse.json({ error: `Source image returned ${response.status}` }, { status: 400 })
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Source URL is not an image" }, { status: 400 })
    }

    const contentLength = Number(response.headers.get("content-length") || 0)
    if (contentLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large" }, { status: 400 })
    }

    const bytes = await response.arrayBuffer()
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large" }, { status: 400 })
    }

    const result = await uploadBuffer(Buffer.from(bytes), folder)

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error("Import image URL error:", error)
    return NextResponse.json({
      error: "Failed to import image",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
