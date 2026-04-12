import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaClient } from "@prisma/client"
import WebSocket from "ws"
import { config } from "dotenv"

// Cargar .env.local explícitamente
config({ path: ".env.local" })

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

neonConfig.webSocketConstructor = WebSocket

const DATABASE_URL = process.env.DATABASE_URL

console.log("DATABASE_URL:", DATABASE_URL ? "SET" : "NOT SET")

let prisma: PrismaClient

if (DATABASE_URL) {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: DATABASE_URL,
    }),
  })
} else {
  // Create a mock Prisma client for development without database
  console.warn("DATABASE_URL not set, using mock client")
  prisma = globalForPrisma.prisma ?? createMockPrismaClient()
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Mock Prisma client for development
function createMockPrismaClient() {
  return {
    product: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    category: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    exchangeRate: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      upsert: async () => null,
      count: async () => 0,
    },
    user: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    order: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    cart: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    cartItem: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    favorite: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    boxStandard: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    adminUser: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
      count: async () => 0,
    },
    $disconnect: async () => {},
    $connect: async () => {},
  } as any
}

export { prisma }
