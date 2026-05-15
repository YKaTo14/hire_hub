import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { rateLimitAuth, getRateLimitIdentifier } from '@/lib/rate-limit'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req)
    const rateLimitResult = rateLimitAuth(identifier)
    
    if (!rateLimitResult.success) {
      return Response.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 900).toString()
          }
        }
      )
    }

    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.password) {
      return Response.json({ error: 'This account does not have a password set' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return Response.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 900).toString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}