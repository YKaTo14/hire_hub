import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  image: z.string().url().optional(),
  bio: z.string().optional()
})

export async function GET(req: Request) {
  try {
    // Try NextAuth first
    const session = await getServerSession(authOptions)
    let userId: number | null = null

    if (session?.user?.email) {
      // Find user by email from NextAuth session
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      userId = user?.id || null
    } else {
      // Fallback to JWT authentication
      const authUser = requireAuth(req)
      userId = authUser.id
    }

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ user })
  } catch (error: any) {
    console.error('[/api/users/me GET error]:', error)
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    // Try NextAuth first
    const session = await getServerSession(authOptions)
    let userId: number | null = null

    if (session?.user?.email) {
      // Find user by email from NextAuth session
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      userId = user?.id || null
    } else {
      // Fallback to JWT authentication
      const authUser = requireAuth(req)
      userId = authUser.id
    }

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, password, image, bio } = profileSchema.parse(body)

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== userId) {
        return Response.json({ error: 'Email already in use' }, { status: 400 })
      }
      updateData.email = email
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }
    if (image !== undefined) updateData.image = image
    if (bio !== undefined) updateData.bio = bio

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
      }
    })

    return Response.json({ user: updatedUser, message: 'Profile updated successfully' })
  } catch (error: any) {
    console.error('[/api/users/me PATCH error]:', error)
    if (error instanceof z.ZodError) return Response.json({ error: error.issues[0].message }, { status: 400 })
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
