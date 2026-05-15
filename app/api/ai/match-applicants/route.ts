import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import Groq from "groq-sdk";

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const user = requireAuth(req);
    if (user.role !== 'EMPLOYER') {
      return Response.json({ error: 'Зөвхөн ажил олгогч ашиглах боломжтой' }, { status: 403 });
    }

    const { jobId } = await req.json();

    // Ажлын байр болон ирсэн анкетуудыг авах
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                bio: true,
              }
            }
          }
        }
      }
    });

    if (!job) {
      return Response.json({ error: 'Ажлын байр олдсонгүй' }, { status: 404 });
    }

    const applicants = job.applications.map(app => ({
      id: app.id,
      name: app.user.name,
      bio: app.user.bio || "Мэдээлэл байхгүй",
      coverLetter: app.coverLetter || "Мэдээлэл байхгүй"
    }));

    const prompt = `
      Та бол ажил зуучлалын AI туслах байна. Танд дараах ажлын байр болон горилогчид байна:
      
      Ажлын байр: ${job.title}
      Тодорхойлолт: ${job.description}
      
      Горилогчид:
      ${JSON.stringify(applicants, null, 2)}
      
      Дээрх горилогчдоос энэ ажлын байранд хамгийн их тохирох хүмүүсийг эрэмбэлж, яагаад тохирч байгааг нь товч тайлбарлаж өгнө үү.
      Мөн тохирохгүй байгаа хүмүүсийн шалтгааныг дурдаарай.
      Хариултыг Монгол хэлээр өгнө үү.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const text = completion.choices[0]?.message?.content || "Уучлаарай, шинжилгээ хийхэд алдаа гарлаа.";

    return Response.json({ analysis: text });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
