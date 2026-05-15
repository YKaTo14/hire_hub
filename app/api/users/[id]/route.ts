import { PrismaClient } from '@prisma/client'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const userUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'MODERATOR', 'EMPLOYER']).optional(),
  name: z.string().min(2).optional(),
  image: z.string().url().optional(),
  bio: z.string().optional()
})

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    // Remove strict admin/moderator check for basic info needed for messaging
    // const user = requireRole(['ADMIN', 'MODERATOR'])(req)

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
      }
    })

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ user: targetUser })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return Response.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user (Admin only)
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const user = requireRole(['ADMIN'])(req)
    const body = await req.json()
    const data = userUpdateSchema.parse(body)

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return Response.json({ user: updatedUser, message: 'User updated successfully' })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 })
    }
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return Response.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const user = requireRole(['ADMIN'])(req)

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting yourself
    if (targetUser.id === user.id) {
      return Response.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return Response.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
