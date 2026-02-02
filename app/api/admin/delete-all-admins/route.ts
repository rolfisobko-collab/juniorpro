import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function DELETE() {
  try {
    console.log('🗑️ Deleting ALL admin users...')

    // Eliminar TODOS los administradores
    const deletedAdmins = await prisma.adminUser.deleteMany({})

    console.log(`✅ Deleted ${deletedAdmins.count} admin users`)

    return NextResponse.json({
      message: "Todos los administradores eliminados exitosamente",
      deletedCount: deletedAdmins.count
    })
  } catch (error) {
    console.error("❌ Error deleting all admin users:", error)
    return NextResponse.json({ error: "Failed to delete admin users" }, { status: 500 })
  }
}
