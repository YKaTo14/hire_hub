import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is required");
  }

  return new Groq({ apiKey });
}

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();

    const completion = await getGroqClient().chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Та бол HireHub платформын AI туслах байна. Та дараах үйлдлүүдийг хийж чадна:
          1. Хэрэглэгчийн ур чадварт тохирсон ажил хайх.
          2. Ажлын байрны мэдээлэл өгөх.
          3. CV бэлдэх зөвлөгөө өгөх.
          
          Хариултаа үргэлж Монгол хэлээр өгнө үү.`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const text = completion.choices[0]?.message?.content || "Уучлаарай, хариулт авахад алдаа гарлаа.";

    return Response.json({ text });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
