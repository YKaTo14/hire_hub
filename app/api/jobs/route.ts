import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  salary: z.number().positive('Salary must be positive'),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']).optional(),
  category: z.enum(['ENGINEERING','MARKETING','SALES','DESIGN','FINANCE','HR','OPERATIONS','PRODUCT','CUSTOMER_SUPPORT','OTHER']).optional(),
  customCategory: z.string().optional(),
  status: z.enum(['ACTIVE', 'CLOSED', 'DRAFT']).optional()
})

export const dynamic = 'force-dynamic'

// GET /api/jobs - List all jobs with search, filter, and pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || 'ACTIVE'
    const location = searchParams.get('location') || ''
    const minSalary = parseInt(searchParams.get('minSalary') || '0')

    const skip = (page - 1) * limit

    const where: any = {
      status: status || undefined
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (type && type !== 'All Types') {
      where.type = type.toUpperCase().replace(' ', '_')
    }

    if (category && category !== 'All Categories') {
      where.category = category.toUpperCase().replace(/\s+/g, '_')
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (minSalary > 0) {
      where.salary = { gte: minSalary }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.job.count({ where })

    return Response.json({ 
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Jobs GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = requireAuth(req)
    
    // Role-based access control: Only EMPLOYER and ADMIN can post jobs
    if (user.role !== 'EMPLOYER' && user.role !== 'ADMIN') {
      return Response.json({ error: 'Only employers can post jobs' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = jobSchema.parse(body)

    const job = await prisma.job.create({
      data: {
        ...validatedData,
        // persist customCategory separately if provided
        customCategory: validatedData.customCategory ?? null,
        employerId: user.id,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return Response.json({ job, message: 'Job posted successfully' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) return Response.json({ error: error.issues[0].message }, { status: 400 })
    if (error.message === 'Unauthorized') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
