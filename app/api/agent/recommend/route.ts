import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const recommendSchema = z.object({
  skills: z.string().optional(),
  preferences: z.string().optional(),
  salaryMin: z.number().optional()
})

// POST /api/agent/recommend - AI-powered job recommendations
export async function POST(req: Request) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const { skills, preferences, salaryMin } = recommendSchema.parse(body)

    // Get user's application history to understand preferences
    const userApplications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        job: true
      },
      take: 10
    })

    // Build recommendation criteria based on user history and input
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      employerId: { not: user.id } // Don't recommend own jobs
    }

    // Exclude jobs already applied to
    const appliedJobIds = userApplications.map((app: any) => app.jobId)
    if (appliedJobIds.length > 0) {
      where.id = { notIn: appliedJobIds }
    }

    // Salary filter
    if (salaryMin) {
      where.salary = { gte: salaryMin }
    }

    // Skills-based filtering (simple keyword matching)
    if (skills) {
      const skillKeywords = skills.split(',').map(s => s.trim().toLowerCase())
      where.OR = skillKeywords.map(keyword => ({
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      }))
    }

    // Get recommended jobs with scoring
    const jobs = await prisma.job.findMany({
      where,
      take: 10,
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Score jobs based on various factors
    const scoredJobs = jobs.map((job: any) => {
      let score = 0

      // Prefer jobs with fewer applications (less competition)
      score += Math.max(0, 20 - job._count.applications)

      // Prefer recent jobs
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      score += Math.max(0, 10 - daysSinceCreation)

      // If user has history, match job types
      if (userApplications.length > 0) {
        const appliedTypes = userApplications.map((app: any) => app.job.type)
        if (appliedTypes.includes(job.type)) {
          score += 5
        }
      }

      // Salary preference
      if (salaryMin && job.salary >= salaryMin * 1.2) {
        score += 10
      }

      return { ...job, score }
    })

    // Sort by score and return top recommendations
    const recommendations = scoredJobs
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5)
      .map((job: any) => ({
        ...job,
        match: {
          score: Math.min(100, job.score * 2),
          reason: `Matched by skills, salary preference, and demand level.`
        }
      }))

    return Response.json({
      recommendations,
      message: 'Generated job recommendations based on your preferences'
    })
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
