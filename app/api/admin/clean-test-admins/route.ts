import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function DELETE() {
  try {
    console.log('🧹 Cleaning test admin users...')

    // Contar admins antes de eliminar
    const adminsBefore = await prisma.adminUser.count()

    // Eliminar admins de prueba comunes
    const testPatterns = [
      '%test%',
      '%example%',
      '%demo%',
      '%prueba%',
      '%mock%',
      '%fake%',
      '%sample%',
      '%admin%',
      '%temp%'
    ]

    const deletedAdmins = await prisma.adminUser.deleteMany({
      where: {
        OR: [
          ...testPatterns.map(pattern => ({
            email: {
              contains: pattern,
              mode: 'insensitive' as const
            }
          })),
          ...testPatterns.map(pattern => ({
            username: {
              contains: pattern,
              mode: 'insensitive' as const
            }
          }))
        ]
      }
    })

    // También eliminar admins sin rol específico o con datos sospechosos
    const suspiciousAdmins = await prisma.adminUser.deleteMany({
      where: {
        OR: [
          {
            role: 'viewer',
            createdAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Más de 24 horas
            }
          },
          {
            name: {
              contains: 'Test',
              mode: 'insensitive' as const
            }
          }
        ]
      }
    })

    // Contar admins después de limpiar
    const adminsAfter = await prisma.adminUser.count()

    console.log(`✅ Cleaned admin users: ${deletedAdmins.count + suspiciousAdmins.count} deleted`)

    return NextResponse.json({
      message: "Admins de prueba limpiados exitosamente",
      deletedTestAdmins: deletedAdmins.count,
      deletedSuspiciousAdmins: suspiciousAdmins.count,
      adminsBefore,
      adminsAfter,
      totalDeleted: deletedAdmins.count + suspiciousAdmins.count
    })
  } catch (error) {
    console.error("❌ Error cleaning test admin users:", error)
    return NextResponse.json({ error: "Failed to clean test admin data" }, { status: 500 })
  }
}
