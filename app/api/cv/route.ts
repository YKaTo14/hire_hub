import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const cvSchema = z.object({
  title: z.string().min(2),
  summary: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  fileUrl: z.string().url().optional(),
  isPrimary: z.boolean().optional()
})

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = requireAuth(req)

    const cvs = await prisma.cV.findMany({
      where: { userId: user.id },
      orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }]
    })

    return Response.json({ cvs })
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
    const data = cvSchema.parse(body)

    if (data.isPrimary) {
      await prisma.cV.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false }
      })
    }

    const cv = await prisma.cV.create({
      data: {
        ...data,
        userId: user.id,
        isPrimary: data.isPrimary ?? false
      }
    })

    return Response.json({ cv, message: 'CV created successfully' }, { status: 201 })
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
