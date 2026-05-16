import { PrismaClient } from '@prisma/client';
import Groq from "groq-sdk";

const prisma = new PrismaClient();

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is required");
  }

  return new Groq({ apiKey });
}

export async function POST(req: Request) {
  try {
    const { skills, experience, location } = await req.json();

    // Fetch all active jobs
    const jobs = await prisma.job.findMany({
      include: {
        employer: {
          select: {
            name: true
          }
        }
      }
    });

    const prompt = `
      Та бол ажил зуучлалын AI туслах байна. Хэрэглэгчийн мэдээлэлд тулгуурлан дараах ажлын байруудаас хамгийн их тохирох 3-ыг нь сонгоно уу.
      
      Хэрэглэгчийн мэдээлэл:
      - Ур чадвар: ${skills}
      - Туршлага: ${experience} жил
      - Хүсэж буй байршил: ${location}
      
      Ажлын байрууд:
      ${JSON.stringify(jobs.map((j: any) => ({ id: j.id, title: j.title, description: j.description, location: j.location, salary: j.salary, employer: j.employer.name })), null, 2)}
      
      Хариултыг JSON форматаар дараах хэлбэртэй өгнө үү:
      {
        "matches": [
          {
            "jobId": number,
            "score": number (0-1 хооронд),
            "explanation": "яагаад тохирч байгаа тухай товч тайлбар Монгол хэлээр"
          }
        ]
      }
      Зөвхөн JSON-ийг буцаана уу, өөр текст битгий бичээрэй.
    `;

    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    const result = JSON.parse(content || '{"matches": []}');

    // Map result back to include full job objects
    const matches = result.matches.map((match: any) => ({
      job: jobs.find((j: any) => j.id === match.jobId),
      score: match.score,
      explanation: match.explanation
    })).filter((m: any) => m.job);

    return Response.json({ matches });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
