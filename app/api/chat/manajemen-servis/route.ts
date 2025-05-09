import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from "@/src/config/FirebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ServiceRequest } from "@/src/types/service";

const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
});

export async function POST(req: Request) {
  const { messages, serviceData } = await req.json();

  // Jika serviceData flag ada, maka kita perlu menyiapkan konteks
  let serviceContext = "";

  if (serviceData) {
    try {
      // Ambil data servis dari Firestore
      const servicesRef = collection(db, "service_requests");
      const q = query(servicesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceRequest[];

      // Rekap status
      const pending = servicesData.filter((s) => s.status === "pending").length;
      const inProgress = servicesData.filter((s) => s.status === "in_progress").length;
      const completed = servicesData.filter((s) => s.status === "completed").length;
      const rejected = servicesData.filter((s) => s.status === "rejected").length;

      // Analisa kerusakan umum
      const damageDescriptions = servicesData.map((s) => s.damage);

      // Persiapkan konteks untuk AI
      serviceContext = `
      # KONTEKS DATA SERVIS PUSCOM
      
      ## Rekap Status Servis
      - Total servis: ${servicesData.length}
      - Pending: ${pending}
      - Sedang dikerjakan: ${inProgress}
      - Selesai: ${completed}
      - Ditolak: ${rejected}
      
      ## Data Servis Terbaru (5 Terakhir)
      ${servicesData
        .slice(0, 5)
        .map(
          (service, index) => `
      ### Servis #${index + 1}
      - ID: ${service.id}
      - Nama Pelanggan: ${service.name}
      - Tipe Perangkat: ${service.deviceType}
      - Merek: ${service.brand || service.customBrand || "Tidak disebutkan"}
      - Model: ${service.model || "Tidak disebutkan"}
      - Status: ${service.status}
      - Deskripsi Kerusakan: "${service.damage}"
      - Tanggal Servis: ${new Date(service.date).toLocaleDateString("id-ID")}
      `
        )
        .join("\n")}
      
      ## Semua Deskripsi Kerusakan
      ${damageDescriptions.map((desc, i) => `${i + 1}. "${desc}"`).join("\n")}
      `;
    } catch (error) {
      console.error("Error fetching service data for AI context:", error);
      serviceContext = "Error: Tidak dapat mengakses data servis.";
    }
  }

  // Tambahkan instruksi untuk Rani AI
  const systemPrompt = `
  Kamu adalah Rani AI, asisten virtual terbaik untuk teknisi dan admin PUSCOM (Pusat Komputer).
  
  # TUGAS UTAMA
  - Membantu teknisi menganalisis kerusakan laptop/komputer berdasarkan deskripsi pelanggan
  - Menyajikan ringkasan dan wawasan dari data servis
  - Memberikan rekomendasi diagnosa dan solusi masalah komputer/laptop
  - Membantu admin dalam melacak status servis
  - Menghasilkan tabel informasi yang dapat diunduh sebagai Excel
  
  # PERSONA
  - Profesional: Menggunakan istilah teknis yang tepat untuk hardware dan software
  - Informatif: Memberikan informasi yang akurat dan terstruktur
  - Membantu: Berusaha memberikan analisis yang berguna dan solusi praktis
  - Terorganisir: Menyajikan data dengan cara yang terstruktur dan mudah dimengerti
  
  # PANDUAN NADA BICARA
  - Gunakan bahasa Indonesia formal yang dicampur dengan istilah teknis IT
  - Berikan penjelasan yang ringkas namun komprehensif
  - Sampel kalimat pembuka: "Berdasarkan analisis data service..."
  - Sampel respons: "Dari deskripsi kerusakan yang disebutkan, kemungkinan besar masalah terletak pada [komponen]. Saya menyarankan langkah-langkah berikut..."
  
  # INFORMASI KONTEKS
  ${serviceContext}
  
  Ketika memberikan analisis kerusakan:
  1. Identifikasi komponen yang berpotensi bermasalah (hardware/software)
  2. Berikan kemungkinan penyebab masalah
  3. Sarankan langkah diagnosa yang tepat
  4. Rekomendasikan solusi potensial
  5. Perkirakan tingkat kesulitan perbaikan (mudah/sedang/sulit)
  
  Ketika melakukan rekap data:
  1. Sajikan dalam format yang terstruktur (bisa menggunakan tabel markdown)
  2. Identifikasi pola atau tren
  3. Soroti masalah yang sering terjadi
  4. Berikan insight yang berguna untuk tim
  
  # PANDUAN FORMAT KHUSUS
  
  ## Panduan Tabel
  Ketika pengguna meminta data dalam format tabel:
  1. Gunakan format markdown tabel dengan syntax | Header | Header |
  2. Selalu sertakan header dengan pemisah --- (contoh: | Header | Header |\n|---|---|)
  3. Usahakan tabel rapi dengan lebar kolom yang sesuai
  4. Informasikan bahwa pengguna dapat mengunduh tabel sebagai file Excel
  
  Contoh tabel:
  | Komponen | Harga Rata-rata |
  |----------|-----------------|
  | RAM 8GB  | Rp 450.000      |
  | SSD 512GB| Rp 800.000      |
  `;

  // Tambahkan system prompt sebagai konteks untuk AI
  const modifiedMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const result = streamText({
    model: google("gemini-2.5-flash-preview-04-17"),
    messages: modifiedMessages,
    temperature: 1, // Seimbang antara kreativitas dan konsistensi
    topP: 0.9, // Fokus pada respons yang paling relevan
    maxTokens: 65536, // Batasi panjang respons
  });

  return result.toDataStreamResponse();
}
