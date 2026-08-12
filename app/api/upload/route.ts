import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

export const runtime = "nodejs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxibpzcfy',
  api_key: process.env.CLOUDINARY_API_KEY || '395575268427478',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'bbE8bMA7stCyME9srmYdw98m0sE',
})

const MAX_IMAGE_BYTES = 25 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo no es una imagen valida' }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'La imagen no debe superar los 25MB' }, { status: 400 })
    }

    // Convertir file a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'juniorweb/products',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json({ 
      success: true,
      url: (result as any).secure_url 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
