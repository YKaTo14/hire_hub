import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const jobUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  salary: z.number().positive().optional(),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']).optional(),
  status: z.enum(['ACTIVE', 'CLOSED', 'DRAFT']).optional()
})

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 })
    }

    return Response.json({ job })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/jobs/[id] - Update a job
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const user = requireAuth(req)
    const body = await req.json()
    const data = jobUpdateSchema.parse(body)

    const existingJob = await prisma.job.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingJob) {
      return Response.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if user is the employer or admin
    if (existingJob.employerId !== user.id && user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data,
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return Response.json({ job, message: 'Job updated successfully' })
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

// DELETE /api/jobs/[id] - Delete a job
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const user = requireAuth(req)

    const existingJob = await prisma.job.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingJob) {
      return Response.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if user is the employer or admin
    if (existingJob.employerId !== user.id && user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.job.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ message: 'Job deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
