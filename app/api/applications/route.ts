import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const applicationSchema = z.object({
  jobId: z.number(),
  coverLetter: z.string().optional(),
  cvUrl: z.string().optional(),
  cvName: z.string().optional(),
})

export const dynamic = 'force-dynamic'

// GET /api/applications - List applications with pagination
export async function GET(req: Request) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    const where: any = {}

    // Users can only see their own applications
    // Employers can see applications for their jobs
    if (user.role === 'EMPLOYER') {
      where.job = {
        employerId: user.id
      }
    } else if (user.role !== 'ADMIN') {
      where.userId = user.id
    } else if (userId) {
      where.userId = parseInt(userId)
    }

    if (status) {
      where.status = status
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          job: {
            include: {
              employer: {
                select: {
                  id: true,
                  email: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count({ where })
    ])

    return Response.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/applications - Create a new application
export async function POST(req: Request) {
  try {
    const user = requireAuth(req)

    // Role-based access control: Only USER (Job Seeker) can apply to jobs
    if (user.role !== 'USER') {
      return Response.json({ error: 'Only job seekers can apply to jobs' }, { status: 403 })
    }

    const body = await req.json()
    const { jobId, coverLetter, cvUrl, cvName } = applicationSchema.parse(body)

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'ACTIVE') {
      return Response.json({ error: 'Job is not accepting applications' }, { status: 400 })
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId
        }
      }
    })

    if (existingApplication) {
      return Response.json({ error: 'Already applied to this job' }, { status: 409 })
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        jobId,
        coverLetter,
        cvUrl,
        cvName,
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    return Response.json({ application, message: 'Application submitted successfully' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 })
    }
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
