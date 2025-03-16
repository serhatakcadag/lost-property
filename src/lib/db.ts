import { ItemCategory, ItemStatus, PrismaClient } from '@prisma/client'
import { sql } from '@vercel/postgres'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const db = {
  // Wrap Prisma Client methods
  async findUser(email: string) {
    return prisma.user.findUnique({
      where: { email, deletedAt: null }
    })
  },
  
  async createUser(data: { email: string; name?: string; password: string }) {
    return prisma.user.create({
      data
    })
  },

  async findItems(options: {
    status?: ItemStatus
    category?: ItemCategory
    searchTerm?: string
  }) {
    return prisma.item.findMany({
      where: {
        deletedAt: null,
        status: options.status,
        category: options.category,
        OR: options.searchTerm
          ? [
              { title: { contains: options.searchTerm, mode: 'insensitive' } },
              { description: { contains: options.searchTerm, mode: 'insensitive' } }
            ]
          : undefined
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        finder: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  // Raw SQL queries using Vercel Postgres when needed
  async rawQuery(query: string) {
    return sql.query(query)
  }
} 