import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const autoApplySchema = z.object({
  criteria: z.object({
    keywords: z.string(),
    maxSalary: z.number().optional(),
    minSalary: z.number().optional(),
    jobTypes: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional()
  }),
  limit: z.number().min(1).max(10).default(3)
})

// POST /api/agent/auto-apply - AI agent automatically applies to matching jobs
export async function POST(req: Request) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const { criteria, limit } = autoApplySchema.parse(body)

    // Build search criteria
    const where: any = {
      status: 'ACTIVE',
      employerId: { not: user.id }
    }

    // Exclude already applied jobs
    const appliedJobs = await prisma.application.findMany({
      where: { userId: user.id },
      select: { jobId: true }
    })
    const appliedJobIds = appliedJobs.map((app: { jobId: number }) => app.jobId)
    if (appliedJobIds.length > 0) {
      where.id = { notIn: appliedJobIds }
    }

    // Keyword filtering
    if (criteria.keywords) {
      const keywords = criteria.keywords.split(',').map(k => k.trim().toLowerCase())
      where.OR = keywords.map(keyword => ({
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      }))
    }

    // Salary range
    if (criteria.minSalary || criteria.maxSalary) {
      where.salary = {}
      if (criteria.minSalary) where.salary.gte = criteria.minSalary
      if (criteria.maxSalary) where.salary.lte = criteria.maxSalary
    }

    // Job types
    if (criteria.jobTypes && criteria.jobTypes.length > 0) {
      where.type = { in: criteria.jobTypes }
    }

    // Locations
    if (criteria.locations && criteria.locations.length > 0) {
      where.location = { in: criteria.locations }
    }

    // Find matching jobs
    const matchingJobs = await prisma.job.findMany({
      where,
      take: limit,
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    // Auto-apply to matching jobs
    const applications = []
    for (const job of matchingJobs) {
      try {
        const application = await prisma.application.create({
          data: {
            userId: user.id,
            jobId: job.id,
            coverLetter: `Auto-generated application via AI Agent. I am interested in this position based on my preferences and skills.`
          },
          include: {
            job: {
              include: {
                employer: {
                  select: {
                    id: true,
                    email: true,
                    name: true
                  }
                }
              }
            }
          }
        })
        applications.push(application)
      } catch (error) {
        // Skip if application already exists (race condition)
        continue
      }
    }

    return Response.json({
      applied: applications.length,
      applications,
      message: `Successfully applied to ${applications.length} jobs automatically`
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 })
    }
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
