import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const messageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.number().optional(),
  applicationId: z.number().optional(),
  jobId: z.number().optional()
})

export async function GET(req: Request) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const otherUserId = searchParams.get('userId')

    if (!otherUserId) {
      // Get all conversations
      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id },
            { receiverId: user.id }
          ]
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Unique conversations by other user
      const uniqueConversations = Array.from(new Map(conversations.map(m => {
        const otherUser = m.senderId === user.id ? m.receiver : m.sender
        return [otherUser.id, { lastMessage: m, otherUser }]
      })).values())

      return Response.json({ conversations: uniqueConversations })
    }

    // Get specific conversation
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: parseInt(otherUserId) },
          { senderId: parseInt(otherUserId), receiverId: user.id }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    })

    return Response.json({ messages })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const { content, receiverId, applicationId, jobId } = messageSchema.parse(body)

    let resolvedReceiverId = receiverId
    let resolvedJobId = jobId

    if (!resolvedReceiverId && !applicationId) {
      return Response.json({ error: 'receiverId or applicationId is required' }, { status: 400 })
    }

    if (applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            select: {
              id: true,
              employerId: true
            }
          }
        }
      })

      if (!application) {
        return Response.json({ error: 'Application not found' }, { status: 404 })
      }

      const isApplicant = application.userId === user.id
      const isEmployer = application.job.employerId === user.id
      const isAdmin = user.role === 'ADMIN'
      const isModerator = user.role === 'MODERATOR'

      if (!isApplicant && !isEmployer && !isAdmin && !isModerator) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (!resolvedReceiverId) {
        resolvedReceiverId = isApplicant ? application.job.employerId : application.userId
      }
      resolvedJobId = application.job.id
    }

    if (!resolvedReceiverId || resolvedReceiverId === user.id) {
      return Response.json({ error: 'Invalid receiver' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId: resolvedReceiverId,
        jobId: resolvedJobId
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    })

    return Response.json({ message }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) return Response.json({ error: error.issues[0].message }, { status: 400 })
    if (error.message === 'Unauthorized') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
