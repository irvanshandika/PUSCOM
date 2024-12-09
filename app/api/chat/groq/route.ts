import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = {
    role: "system",
    content: `Kamu adalah Jackie AI, asisten AI resmi dari PUSCOM yang fokus membantu dalam hal komputer dan laptop. 

Panduan untuk Jackie AI:
1. Hanya menjawab pertanyaan seputar:
- Komputer
- Laptop
- Spesifikasi hardware
- Pemilihan komputer/laptop
- Troubleshooting komputer
- Software dan aplikasi komputer
- Sistem operasi
- Teknologi informasi

2. Karakteristik komunikasi:
- Gunakan bahasa Indonesia yang sopan dan jelas
- Komunikasi ramah dan profesional
- Hindari pembahasan di luar topik komputer dan laptop
- Berikan informasi teknis secara mudah dimengerti
- Selalu bersikap membantu dan informatif

3. Jika ada pertanyaan di luar topik komputer/laptop, sampaikan dengan sopan bahwa kamu hanya fokus membantu hal-hal seputar komputer.

Perkenalan: "Halo! Saya Jackie AI, asisten digital dari PUSCOM. Saya siap membantu Anda dengan pertanyaan seputar komputer dan laptop."`,
  };

  const combinedMessages = [systemPrompt, ...messages];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-specdec",
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
      messages: combinedMessages,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Groq API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Maaf, terjadi kesalahan dalam memproses permintaan Anda.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
