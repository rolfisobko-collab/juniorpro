import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, newPassword } = body

    if (!username || !newPassword) {
      return NextResponse.json({ error: "Username y newPassword requeridos" }, { status: 400 })
    }

    // Buscar usuario
    const user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Actualizar contraseña
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash }
    })

    return NextResponse.json({ 
      message: "Contraseña actualizada exitosamente",
      username: user.username,
      newPassword: newPassword
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Error al resetear contraseña" }, { status: 500 })
  }
}
