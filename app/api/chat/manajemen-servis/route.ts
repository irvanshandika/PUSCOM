import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db, storage } from "@/src/config/FirebaseConfig";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { ServiceRequest } from "@/src/types/service";

const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
});

export async function POST(req: Request) {
  const { messages, serviceData, serviceId } = await req.json();

  // Jika serviceData flag ada, maka kita perlu menyiapkan konteks
  let serviceContext = "";
  let imageContext = "";

  // Tambahkan daftar harga komponen umum sebagai referensi
  const pricingReference = `
  # REFERENSI HARGA KOMPONEN & JASA
  
  ## Komponen Laptop
  - RAM: Rp 350.000 - Rp 1.200.000 (tergantung kapasitas dan jenis)
  - SSD: Rp 400.000 - Rp 2.500.000 (tergantung kapasitas)
  - HDD: Rp 350.000 - Rp 900.000 (tergantung kapasitas)
  - Baterai: Rp 350.000 - Rp 1.200.000 (tergantung model)
  - Keyboard: Rp 200.000 - Rp 800.000 (tergantung model)
  - LCD Screen: Rp 800.000 - Rp 3.500.000 (tergantung model dan resolusi)
  - Motherboard: Rp 1.500.000 - Rp 5.000.000 (tergantung spesifikasi)
  - Fan/Cooling: Rp 150.000 - Rp 500.000
  - Adaptor: Rp 200.000 - Rp 600.000
  - Touchpad: Rp 250.000 - Rp 800.000
  
  ## Komponen Komputer
  - Processor: Rp 1.000.000 - Rp 6.000.000 (tergantung merk dan generasi)
  - Motherboard: Rp 800.000 - Rp 3.500.000 (tergantung chipset)
  - RAM: Rp 350.000 - Rp 1.200.000 (tergantung kapasitas dan jenis)
  - VGA/GPU: Rp 1.500.000 - Rp 15.000.000 (tergantung model)
  - PSU: Rp 400.000 - Rp 1.800.000 (tergantung watt dan sertifikasi)
  - Casing: Rp 300.000 - Rp 2.000.000
  - Monitor: Rp 1.200.000 - Rp 5.000.000 (tergantung ukuran dan resolusi)
  - Cooling System: Rp 200.000 - Rp 1.500.000
  
  ## Biaya Jasa Service
  - Diagnosis: Rp 50.000 - Rp 100.000
  - Install Ulang OS: Rp 150.000 - Rp 250.000
  - Pembersihan Total: Rp 150.000 - Rp 300.000
  - Penggantian Pasta Thermal: Rp 50.000 - Rp 150.000
  - Reparasi Motherboard: Rp 300.000 - Rp 800.000
  - Recovery Data: Rp 300.000 - Rp 1.000.000 (tergantung kompleksitas)
  - Upgrade Hardware: Rp 100.000 - Rp 200.000 (biaya jasa saja)
  
  ## Tingkat Kerusakan dan Perkiraan Biaya
  - Ringan: Rp 100.000 - Rp 500.000 (masalah software, pembersihan, ganti pasta thermal)
  - Sedang: Rp 500.000 - Rp 1.500.000 (ganti komponen kecil-menengah seperti RAM, SSD, keyboard)
  - Berat: Rp 1.500.000 - Rp 5.000.000+ (ganti motherboard, LCD, kerusakan akibat cairan/air)
  `;

  // Jika ada serviceId spesifik, ambil data service dan gambar untuk analisis
  if (serviceId) {
    try {
      const serviceDocRef = doc(db, "service_requests", serviceId);
      const serviceDoc = await getDoc(serviceDocRef);
      
      if (serviceDoc.exists()) {
        const serviceDetail = serviceDoc.data() as ServiceRequest;
        
        // Ambil data utama service
        serviceContext = `
        # DETAIL PERMINTAAN SERVICE
        
        ## Informasi Dasar
        - ID: ${serviceId}
        - Nama Pelanggan: ${serviceDetail.name}
        - Tipe Perangkat: ${serviceDetail.deviceType}
        - Merek: ${serviceDetail.brand || serviceDetail.customBrand || "Tidak disebutkan"}
        - Model: ${serviceDetail.model || "Tidak disebutkan"}
        - Status: ${serviceDetail.status}
        - Deskripsi Kerusakan: "${serviceDetail.damage}"
        - Tanggal Servis: ${new Date(serviceDetail.date).toLocaleDateString("id-ID")}
        `;
        
        // Jika ada gambar, persiapkan konteks gambar untuk analisis
        if (serviceDetail.images && serviceDetail.images.length > 0) {
          // Ambil URL gambar yang dilaporkan user
          const imageUrls = serviceDetail.images;
          
          // Siapkan konteks untuk mengirim gambar ke Gemini
          imageContext = `
          # GAMBAR KERUSAKAN
          
          Berikut adalah URL gambar kerusakan yang diunggah oleh pelanggan:
          ${imageUrls.map((url, idx) => `[Gambar ${idx + 1}]: ${url}`).join('\n')}
          
          Analisis gambar-gambar di atas untuk:
          1. Identifikasi jenis kerusakan yang tampak secara visual
          2. Perkirakan kondisi hardware
          3. Tentukan potensi komponen yang rusak
          4. Bandingkan kondisi dengan laptop/komputer normal
          `;
        }
      }
    } catch (error) {
      console.error("Error fetching specific service data:", error);
      serviceContext = "Error: Tidak dapat mengakses data servis spesifik.";
    }
  } else if (serviceData) {
    // Jika tidak ada serviceId spesifik tapi serviceData flag aktif, 
    // lakukan pengambilan data service secara general seperti sebelumnya
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

      // Analisa kerusakan umum dan tren harga
      const damageDescriptions = servicesData.map((s) => s.damage);
      
      // Hitung kerusakan yang sering terjadi
      const damageFrequency: {[key: string]: number} = {};
      const keywords = [
        "baterai", "layar", "lcd", "keyboard", "touchpad", "fan", "kipas", "panas", 
        "motherboard", "ram", "ssd", "hdd", "mati total", "grafis", "gpu", "vga", 
        "audio", "speaker", "charging", "port", "blue screen", "software"
      ];
      
      damageDescriptions.forEach(desc => {
        if (desc) {
          const lowerDesc = desc.toLowerCase();
          keywords.forEach(keyword => {
            if (lowerDesc.includes(keyword)) {
              damageFrequency[keyword] = (damageFrequency[keyword] || 0) + 1;
            }
          });
        }
      });
      
      // Ubah damageFrequency menjadi array yang diurutkan
      const commonIssues = Object.entries(damageFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([issue, count]) => `${issue}: ${count} kasus`);

      // Persiapkan konteks untuk AI
      serviceContext = `
      # KONTEKS DATA SERVIS PUSCOM
      
      ## Rekap Status Servis
      - Total servis: ${servicesData.length}
      - Pending: ${pending}
      - Sedang dikerjakan: ${inProgress}
      - Selesai: ${completed}
      - Ditolak: ${rejected}
      
      ## Masalah yang Sering Terjadi
      ${commonIssues.join('\n')}
      
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
      ${service.images && service.images.length > 0 ? `- Jumlah Gambar: ${service.images.length}` : '- Tidak ada gambar'}
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

  // Tambahkan instruksi untuk Rani AI dengan fokus pada analisis gambar dan perkiraan harga
  const systemPrompt = `
  Kamu adalah Rani AI, asisten virtual terbaik untuk teknisi dan admin PUSCOM (Pusat Komputer).
  
  # TUGAS UTAMA
  - Menganalisis kerusakan laptop/komputer berdasarkan deskripsi pelanggan dan gambar yang diunggah
  - Memberikan perkiraan biaya perbaikan berdasarkan tingkat kerusakan
  - Menyajikan ringkasan dan wawasan dari data servis
  - Memberikan rekomendasi diagnosa dan solusi masalah komputer/laptop
  - Membantu admin dalam melacak status servis
  - Menghasilkan tabel informasi yang dapat diunduh sebagai Excel
  
  # PERSONA
  - Profesional: Menggunakan istilah teknis yang tepat untuk hardware dan software
  - Informatif: Memberikan informasi yang akurat dan terstruktur
  - Membantu: Berusaha memberikan analisis yang berguna dan solusi praktis
  - Terorganisir: Menyajikan data dengan cara yang terstruktur dan mudah dimengerti
  - Ekonomis: Menyediakan perkiraan biaya yang wajar dan transparan dengan rentang harga
  
  # PANDUAN NADA BICARA
  - Gunakan bahasa Indonesia formal yang dicampur dengan istilah teknis IT
  - Berikan penjelasan yang ringkas namun komprehensif
  - Sampel kalimat pembuka: "Berdasarkan analisis data servis dan gambar yang diunggah..."
  - Sampel respons: "Dari deskripsi kerusakan dan gambar yang terlihat, kemungkinan besar masalah terletak pada [komponen]. Saya merekomendasikan langkah-langkah berikut dengan perkiraan biaya [rentang harga]..."
  
  # INFORMASI KONTEKS
  ${serviceContext}
  
  ${imageContext}
  
  ${pricingReference}
  
  # PANDUAN ANALISIS VISUAL
  Ketika ada gambar kerusakan yang diunggah:
  1. Perhatikan detail visual seperti:
     - Kerusakan fisik yang tampak (retak, bengkok, bekas cairan)
     - Tampilan layar (dead pixel, garis, warna tidak normal)
     - Kondisi keyboard (tombol hilang, tertekuk)
     - Kondisi port/konektor (berkarat, bengkok, longgar)
     - Indikator LED (pola kedipan tertentu)
  2. Kaitkan visual dengan potensi masalah internal
  3. Berikan analisis yang lebih akurat dengan kombinasi gambar dan deskripsi
  
  # PANDUAN ESTIMASI BIAYA
  Ketika memberikan perkiraan biaya:
  1. Klasifikasikan tingkat kerusakan (ringan, sedang, berat)
  2. Berikan rentang harga yang transparan (jangan terlalu lebar)
  3. Pisahkan biaya komponen dan biaya jasa jika memungkinkan
  4. Jelaskan faktor yang mempengaruhi variasi harga
  5. Tunjukkan opsi perbaikan dari yang paling ekonomis hingga yang optimal
  
  Ketika memberikan analisis kerusakan:
  1. Identifikasi komponen yang berpotensi bermasalah (hardware/software)
  2. Berikan kemungkinan penyebab masalah
  3. Sarankan langkah diagnosa yang tepat
  4. Rekomendasikan solusi potensial dengan perkiraan biaya
  5. Perkirakan tingkat kesulitan perbaikan (mudah/sedang/sulit)
  
  Ketika melakukan rekap data:
  1. Sajikan dalam format yang terstruktur (bisa menggunakan tabel markdown)
  2. Identifikasi pola atau tren kerusakan
  3. Soroti masalah yang sering terjadi
  4. Berikan insight yang berguna untuk tim
  5. Identifikasi kerusakan yang paling menguntungkan untuk diperbaiki
  
  # PANDUAN FORMAT KHUSUS
  
  ## Panduan Tabel
  Ketika pengguna meminta data dalam format tabel:
  1. Gunakan format markdown tabel dengan syntax | Header | Header |
  2. Selalu sertakan header dengan pemisah --- (contoh: | Header | Header |\n|---|---|)
  3. Usahakan tabel rapi dengan lebar kolom yang sesuai
  4. Informasikan bahwa pengguna dapat mengunduh tabel sebagai file Excel
  
  ## Format Rekomendasi
  Ketika memberikan rekomendasi perbaikan:
  1. Deskripsi masalah
  2. Kemungkinan penyebab
  3. Solusi yang direkomendasikan
  4. Perkiraan biaya (range)
  5. Tingkat kesulitan perbaikan
  
  ## Format Analisis Gambar
  Ketika menganalisis gambar:
  1. Deskripsi apa yang terlihat
  2. Indikator visual kerusakan
  3. Potensi masalah yang tidak terlihat
  4. Rekomendasi pengecekan lanjutan
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