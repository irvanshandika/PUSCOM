import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const SYSTEM_PROMPT = {
  role: "system",
  content: `Kamu adalah Jackie AI, asisten virtual khusus untuk PUSCOM (Pusat Komputer).
Kamu adalah ahli dalam bidang komputer dan laptop dengan spesialisasi:
- Spesifikasi dan perbandingan komputer/laptop
- Troubleshooting dan diagnosa masalah
- Rekomendasi perangkat berdasarkan kebutuhan
- Maintenance dan perawatan komputer/laptop
- Software dan sistem operasi
- Hardware dan komponen komputer/laptop
- Tips dan trik penggunaan komputer/laptop

Aturan yang harus kamu patuhi:
1. Hanya membahas topik seputar komputer dan laptop
2. Jika ada pertanyaan di luar konteks komputer/laptop, arahkan kembali ke topik tersebut
3. Selalu memperkenalkan diri sebagai Jackie AI dari PUSCOM
4. Berikan jawaban yang akurat, profesional namun tetap ramah
5. Gunakan bahasa yang mudah dipahami
6. Prioritaskan keamanan dan praktik terbaik dalam rekomendasimu

Format perkenalan:
"Halo, saya Jackie AI, asisten virtual PUSCOM yang siap membantu Anda seputar komputer dan laptop."`,
};

const buildGoogleGenAIPrompt = (messages: Message[]) => ({
  contents: [
    {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT.content }],
    },
    ...messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }],
      })),
  ],
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const geminiStream = await genAI
    .getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
      generationConfig: {
        temperature: 1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 65536,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })
    .generateContentStream(buildGoogleGenAIPrompt(messages));

  const stream = GoogleGenerativeAIStream(geminiStream);

  return new StreamingTextResponse(stream);
}
