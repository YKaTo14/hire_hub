import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const companies = await prisma.user.findMany({
      where: {
        role: 'EMPLOYER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        _count: {
          select: {
            jobs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json({ companies })
  } catch (error: any) {
    console.error("Fetch companies error:", error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
