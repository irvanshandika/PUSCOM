/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";
import { db } from "@/src/config/FirebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";

// Inisialisasi model Gemini dengan API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Fungsi untuk mengagregasi data servis berdasarkan unit waktu (harian, bulanan, tahunan)
const generateRekapData = (serviceData: any[], timeUnit: "day" | "month" | "year") => {
  const grouped = serviceData.reduce((acc, service) => {
    // Pastikan field "date" dapat dikonversi ke Date
    const date = new Date(service.date);
    let key: string;
    if (timeUnit === "day") {
      key = format(date, "yyyy-MM-dd");
    } else if (timeUnit === "month") {
      key = format(date, "yyyy-MM");
    } else {
      key = format(date, "yyyy");
    }
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.keys(grouped)
    .map((key) => ({ time: key, total: grouped[key] }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

// Fungsi untuk membangun prompt AI dengan memasukkan pesan chat dan data servis (detail dan rekap)
const buildGoogleGenAIPrompt = (messages: Message[], serviceData: any[], dailyRecap: any[], monthlyRecap: any[], yearlyRecap: any[]) => ({
  contents: [
    // Sertakan pesan-pesan dari chat
    ...messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }],
      })),
    // Tambahkan informasi servis sebagai konteks untuk analisis
    {
      role: "assistant",
      parts: [
        {
          text: `Berikut adalah data servis pengguna:
${serviceData
  .map(
    (service) =>
      `Nama: ${service.name}
Nomor HP: ${service.phoneNumber}
Email: ${service.email}
Perangkat: ${service.deviceType}
Brand: ${service.brand}
Model: ${service.model}
Tipe Komputer: ${service.computerType}
Damage: ${service.damage}
Tanggal: ${format(new Date(service.date), "dd MMMM yyyy")}
Status: ${service.status}\n`
  )
  .join("\n")}

Rekap Data Servis Harian:
${dailyRecap.map((item) => `${item.time}: ${item.total}`).join("\n")}

Rekap Data Servis Bulanan:
${monthlyRecap.map((item) => `${item.time}: ${item.total}`).join("\n")}

Rekap Data Servis Tahunan:
${yearlyRecap.map((item) => `${item.time}: ${item.total}`).join("\n")}

Tolong analisa data kerusakan di kolom 'damage' dan berikan rekomendasi perbaikan untuk servis yang masuk.`,
        },
      ],
    },
  ],
});

export async function POST(req: Request) {
  // Ambil pesan chat dari request body
  const { messages } = await req.json();

  // Ambil data servis dari koleksi "service_requests" dan urutkan berdasarkan field "date"
  const servicesRef = collection(db, "service_requests");
  const q = query(servicesRef, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  const serviceData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Buat rekap data berdasarkan hari, bulan, dan tahun
  const dailyRecap = generateRekapData(serviceData, "day");
  const monthlyRecap = generateRekapData(serviceData, "month");
  const yearlyRecap = generateRekapData(serviceData, "year");

  // Bangun prompt untuk Gemini AI
  const prompt = buildGoogleGenAIPrompt(messages, serviceData, dailyRecap, monthlyRecap, yearlyRecap);

  // Panggil API Google Gemini AI dengan prompt yang telah dibangun
  const geminiStream = await genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" }).generateContentStream(prompt);

  const stream = GoogleGenerativeAIStream(geminiStream);

  return new StreamingTextResponse(stream);
}
