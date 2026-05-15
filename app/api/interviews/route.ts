import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const createInterviewSchema = z.object({
  applicationId: z.number(),
  scheduledAt: z.string().datetime(),
  durationMinute: z.number().int().positive().max(240).optional(),
  mode: z.enum(['ONLINE', 'ONSITE', 'PHONE']).optional(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional(),
  notes: z.string().optional(),
  interviewerId: z.number().optional()
})

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get('applicationId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (applicationId) {
      where.applicationId = Number(applicationId)
    }
    if (status) {
      where.status = status
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      where.OR = [
        { interviewerId: user.id },
        { application: { userId: user.id } },
        { application: { job: { employerId: user.id } } }
      ]
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        interviewer: { select: { id: true, email: true, name: true, role: true } },
        application: {
          include: {
            user: { select: { id: true, email: true, name: true } },
            job: {
              select: {
                id: true,
                title: true,
                employerId: true,
                employer: { select: { id: true, email: true, name: true } }
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return Response.json({ interviews })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const data = createInterviewSchema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { job: true }
    })

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 })
    }

    const isApplicant = application.userId === user.id

    const canSchedule =
      user.role === 'ADMIN' ||
      user.role === 'MODERATOR' ||
      application.job.employerId === user.id ||
      isApplicant

    if (!canSchedule) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // JobSeeker can only assign themselves as interviewer for self-created requests.
    if (isApplicant && data.interviewerId && data.interviewerId !== user.id) {
      return Response.json({ error: 'Invalid interviewer assignment' }, { status: 400 })
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        scheduledAt: new Date(data.scheduledAt),
        durationMinute: data.durationMinute ?? 60,
        mode: data.mode ?? 'ONLINE',
        location: data.location,
        meetingLink: data.meetingLink,
        notes: data.notes,
        interviewerId: data.interviewerId ?? user.id
      },
      include: {
        interviewer: { select: { id: true, email: true, name: true, role: true } },
        application: {
          include: {
            user: { select: { id: true, email: true, name: true } },
            job: { select: { id: true, title: true, employerId: true } }
          }
        }
      }
    })

    await prisma.application.update({
      where: { id: data.applicationId },
      data: { status: 'UNDER_REVIEW' }
    })

    return Response.json({ interview, message: 'Interview scheduled successfully' }, { status: 201 })
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
