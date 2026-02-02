import { NextResponse } from "next/server"

import { requireAdminId } from "@/lib/admin-session"
import { prisma } from "@/lib/db"

export async function DELETE() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Eliminar usuarios de prueba comunes
    const testEmailPatterns = [
      '%test%',
      '%example%',
      '%demo%',
      '%prueba%',
      '%mock%',
      '%fake%',
      '%sample%'
    ]

    // Contar usuarios antes de eliminar
    const usersBefore = await prisma.user.count()

    // Eliminar usuarios con emails de prueba
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        OR: testEmailPatterns.map(pattern => ({
          email: {
            contains: pattern,
            mode: 'insensitive'
          }
        }))
      }
    })

    // También eliminar usuarios sin pedidos (probablemente de prueba)
    const usersWithoutOrders = await prisma.user.deleteMany({
      where: {
        orders: {
          none: {}
        },
        email: {
          not: {
            contains: '@gmail.com'
          }
        }
      }
    })

    // Contar usuarios después de limpiar
    const usersAfter = await prisma.user.count()

    return NextResponse.json({
      message: "Datos de prueba limpiados exitosamente",
      deletedTestUsers: deletedUsers.count,
      deletedUsersWithoutOrders: usersWithoutOrders.count,
      usersBefore,
      usersAfter,
      totalDeleted: deletedUsers.count + usersWithoutOrders.count
    })
  } catch (error) {
    console.error("Error cleaning test data:", error)
    return NextResponse.json({ error: "Failed to clean test data" }, { status: 500 })
  }
}
