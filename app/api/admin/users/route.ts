import { NextResponse } from "next/server"

import { requireAdminId } from "@/lib/admin-session"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const adminId = await requireAdminId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Obtener usuarios de la base de datos local
    const dbUsers = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            total: true
          }
        },
        addresses: {
          select: {
            phone: true,
            address: true,
            city: true,
            state: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformar los datos para el frontend
    const users = dbUsers.map(user => {
      const totalOrders = user.orders.length
      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
      const primaryAddress = user.addresses[0]

      return {
        id: user.id,
        name: user.name || 'Sin nombre',
        email: user.email,
        phone: primaryAddress?.phone || 'No especificado',
        address: primaryAddress ? `${primaryAddress.address}, ${primaryAddress.city}, ${primaryAddress.state}` : 'No especificado',
        totalOrders,
        totalSpent,
        status: user.emailVerified ? "active" : "inactive", // Usar emailVerified como estado
        joinedDate: user.createdAt.toISOString().split('T')[0],
        lastLogin: null // User model no tiene lastLogin
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
