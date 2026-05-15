import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { rateLimitAuth, getRateLimitIdentifier } from '@/lib/rate-limit'

const prisma = new PrismaClient()

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.nativeEnum(Role).default(Role.USER),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
}).passthrough()

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req)
    const rateLimitResult = rateLimitAuth(identifier)
    
    if (!rateLimitResult.success) {
      return Response.json(
        { error: 'Too many registration attempts. Please try again later.' },
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
    const { email, password, name, role } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return Response.json({ user, token, message: 'User registered successfully' }, { 
      status: 201,
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 900).toString()
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}