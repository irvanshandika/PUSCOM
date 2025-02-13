import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";
import { db } from "@/src/config/FirebaseConfig"; // Pastikan sudah terhubung dengan Firestore
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { ServiceRequest } from "@/src/types/service"; // Mengimpor tipe data untuk ServiceRequest

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Function untuk mengambil data servis dari Firestore
const fetchServiceData = async (timeRange: string) => {
  try {
    const servicesRef = collection(db, "service_requests");

    // Filter berdasarkan waktu (harian, bulanan, tahunan)
    const startDate = new Date();
    if (timeRange === "daily") {
      startDate.setDate(startDate.getDate() - 1);
    } else if (timeRange === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === "yearly") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Query untuk mendapatkan data servis berdasarkan waktu
    const q = query(servicesRef, where("createdAt", ">=", Timestamp.fromDate(startDate)), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    const serviceData: ServiceRequest[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ServiceRequest[];

    return serviceData;
  } catch (error) {
    console.error("Error fetching service data:", error);
    throw new Error("Failed to fetch service data");
  }
};

// Function untuk membangun prompt AI
const buildGoogleGenAIPrompt = (messages: Message[], serviceData: ServiceRequest[]) => ({
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `Berikut adalah data servis yang masuk dalam rentang waktu yang diminta:
          ${serviceData
            .map(
              (service) => `
            - Nama: ${service.name}, Tipe Perangkat: ${service.deviceType}, Kerusakan: ${service.damage}, Status: ${service.status}, Tanggal: ${service.createdAt.toDate().toLocaleDateString()}
          `
            )
            .join("\n")}
          Berdasarkan data di atas, bisa memberikan analisa mengenai jenis kerusakan yang sering terjadi dan rekap data servis harian, bulanan, dan tahunan?`,
        },
      ],
    },
    ...messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }],
      })),
  ],
});

// API Route untuk menangani permintaan dari frontend
export async function POST(req: Request) {
  try {
    const { messages, timeRange } = await req.json(); // Mendapatkan pesan dan rentang waktu dari frontend

    // Fetch data servis dari Firestore
    const serviceData = await fetchServiceData(timeRange);

    // Bangun prompt untuk AI dengan menyertakan data servis
    const prompt = buildGoogleGenAIPrompt(messages, serviceData);

    // Mengambil stream konten dari model Gemini
    const geminiStream = await genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" }).generateContentStream(prompt);

    const stream = GoogleGenerativeAIStream(geminiStream);

    // Mengembalikan respons streaming dari AI
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Error handling request", { status: 500 });
  }
}
