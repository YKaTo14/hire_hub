import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return Response.json({ 
        message: 'Имэйл илгээгдсэн байна (хэрэв бүртгэлтэй бол)' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with reset token (you might want to add these fields to your schema)
    // For now, we'll just return success message
    // In production, you'd save the token hash and expiry to database, then send email

    // TODO: Send email with reset link
    // const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    
    console.log(`Reset token for ${email}: ${resetToken}`)
    console.log(`Reset link would be: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)

    return Response.json({ 
      message: 'Имэйл илгээгдсэн байна (хэрэв бүртгэлтэй бол)' 
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Буруу имэйл формат' }, { status: 400 })
    }
    console.error('Forgot password error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
