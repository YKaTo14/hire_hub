import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '@/lib/auth'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/users - List all users (Admin only)
export async function GET(req: Request) {
  try {
    const user = requireRole(['ADMIN', 'MODERATOR'])(req)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              jobs: true,
              applications: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return Response.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return Response.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
