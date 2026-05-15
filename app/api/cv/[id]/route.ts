import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const cvUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  summary: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  fileUrl: z.string().url().optional(),
  isPrimary: z.boolean().optional()
})

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: paramId } = params;
    const user = requireAuth(req)
    const body = await req.json()
    const data = cvUpdateSchema.parse(body)
    const id = Number(paramId)

    const existing = await prisma.cV.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'CV not found' }, { status: 404 })
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (data.isPrimary) {
      await prisma.cV.updateMany({
        where: { userId: existing.userId, isPrimary: true },
        data: { isPrimary: false }
      })
    }

    const cv = await prisma.cV.update({
      where: { id },
      data
    })

    return Response.json({ cv, message: 'CV updated successfully' })
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

    const existing = await prisma.cV.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'CV not found' }, { status: 404 })
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.cV.delete({ where: { id } })
    return Response.json({ message: 'CV deleted successfully' })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
