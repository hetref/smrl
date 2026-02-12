import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global

// Create Prisma client with optimized connection pooling for serverless
const createPrismaClient = () => {
  // Connection pool configuration optimized for serverless
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Minimize connections in serverless environment
    idleTimeoutMillis: 10000, // Close idle connections after 10s
    connectionTimeoutMillis: 5000,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  })
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma