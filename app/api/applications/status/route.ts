import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const user = requireAuth(req);
    if (user.role !== 'EMPLOYER') {
      return Response.json({ error: 'Зөвхөн ажил олгогч хариу өгөх боломжтой' }, { status: 403 });
    }

    const { applicationId, status } = await req.json();

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: true,
        user: true,
      }
    });

    return Response.json(application);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
