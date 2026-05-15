import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const applicationUpdateSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'UNDER_REVIEW']).optional()
})

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const user = requireAuth(req)

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
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
      }
    })

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user is the applicant, job employer, or admin
    const isApplicant = application.userId === user.id
    const isEmployer = application.job.employerId === user.id
    const isAdmin = user.role === 'ADMIN'

    if (!isApplicant && !isEmployer && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    return Response.json({ application })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/applications/[id] - Update application status
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const user = requireAuth(req)
    const body = await req.json()
    const { status } = applicationUpdateSchema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true
      }
    })

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only employer or admin can update status
    const isEmployer = application.job.employerId === user.id
    const isAdmin = user.role === 'ADMIN'
    const isModerator = user.role === 'MODERATOR'

    if (!isEmployer && !isAdmin && !isModerator) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedApplication = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { status },
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
      }
    })

    return Response.json({ application: updatedApplication, message: 'Application updated successfully' })
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

// DELETE /api/applications/[id] - Delete an application
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const user = requireAuth(req)

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) }
    })

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only applicant can delete their own application, or admin
    const isApplicant = application.userId === user.id
    const isAdmin = user.role === 'ADMIN'

    if (!isApplicant && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.application.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ message: 'Application deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
