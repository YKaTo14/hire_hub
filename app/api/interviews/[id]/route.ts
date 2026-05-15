import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const updateInterviewSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  durationMinute: z.number().int().positive().max(240).optional(),
  mode: z.enum(['ONLINE', 'ONSITE', 'PHONE']).optional(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional()
})

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: paramId } = params;
    const user = requireAuth(req)
    const body = await req.json()
    const data = updateInterviewSchema.parse(body)
    const id = Number(paramId)

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: true
          }
        }
      }
    })

    if (!existing) {
      return Response.json({ error: 'Interview not found' }, { status: 404 })
    }

    const canManage =
      user.role === 'ADMIN' ||
      user.role === 'MODERATOR' ||
      existing.application.job.employerId === user.id ||
      existing.interviewerId === user.id

    if (!canManage) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined
      }
    })

    return Response.json({ interview, message: 'Interview updated successfully' })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: paramId } = params;
    const user = requireAuth(req)
    const id = Number(paramId)

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { job: true } } }
    })

    if (!existing) {
      return Response.json({ error: 'Interview not found' }, { status: 404 })
    }

    const canDelete =
      user.role === 'ADMIN' ||
      user.role === 'MODERATOR' ||
      existing.application.job.employerId === user.id

    if (!canDelete) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.interview.delete({ where: { id } })
    return Response.json({ message: 'Interview deleted successfully' })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
