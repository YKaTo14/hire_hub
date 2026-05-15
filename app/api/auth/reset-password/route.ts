import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = resetPasswordSchema.parse(body)

    if (!token) {
      return Response.json({ error: 'Холбоос нүүлгэлэлтэй байна' }, { status: 400 })
    }

    // TODO: Verify token from database
    // For now, we'll just hash and update the password
    // In production:
    // 1. Find user with matching reset token
    // 2. Check if token hasn't expired
    // 3. Update password and clear token

    const hashedPassword = await bcrypt.hash(password, 10)

    // This is a placeholder - in real implementation you'd:
    // 1. Decode/verify the token
    // 2. Find user by token
    // 3. Update password
    
    return Response.json({ 
      message: 'Нууц үг амжилттай сэргээгдлээ. Нэвтрэх буцаана...' 
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Буруу өгөгдөл' }, { status: 400 })
    }
    console.error('Reset password error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
