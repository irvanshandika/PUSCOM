"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Printer } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ServiceData {
  name: string;
  phoneNumber: string;
  email: string;
  deviceType: string;
  computerTypes?: string;
  brand?: string;
  customBrand?: string;
  model?: string;
  damage: string;
  date: string;
  images: string[];
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function ServiceReceipt() {
  const params = useParams();
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const docRef = doc(db, "service_requests", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setServiceData(docSnap.data() as ServiceData);
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchServiceData();
    }
  }, [params.id]);

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Data tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[800px] mx-auto">
        {/* Print Button */}
        <div className="print:hidden mb-6 flex justify-end">
          <Button onClick={handlePrintPDF} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Simpan PDF
          </Button>
        </div>

        {/* Receipt Card */}
        <Card className="bg-white shadow-md print:shadow-none">
          {/* Header */}
          <div className="border-b p-6 text-center">
            {/* Company Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-32 h-12 bg-primary/10 flex items-center justify-center rounded">
                <span className="font-bold text-primary">LOGO</span>
              </div>
            </div>
            
            {/* Receipt Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Service Receipt
            </h1>
            
            {/* Receipt Details */}
            <div className="text-sm text-gray-600">
              <p className="font-medium">No. #{params.id}</p>
              <p>
                {format(
                  new Date(serviceData.createdAt.seconds * 1000),
                  "dd MMMM yyyy, HH:mm",
                  { locale: id }
                )}
              </p>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6 space-y-8">
            {/* Customer Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Informasi Pelanggan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Nama</label>
                  <p className="font-medium text-gray-900">{serviceData.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Nomor HP</label>
                  <p className="font-medium text-gray-900">
                    {serviceData.phoneNumber}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900">{serviceData.email}</p>
                </div>
              </div>
            </section>

            {/* Device Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Informasi Perangkat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Jenis Perangkat</label>
                  <p className="font-medium text-gray-900">
                    {serviceData.deviceType}
                  </p>
                </div>
                {serviceData.computerTypes && (
                  <div>
                    <label className="text-sm text-gray-600">Tipe Komputer</label>
                    <p className="font-medium text-gray-900">
                      {serviceData.computerTypes}
                    </p>
                  </div>
                )}
                {serviceData.brand && (
                  <div>
                    <label className="text-sm text-gray-600">Merek</label>
                    <p className="font-medium text-gray-900">
                      {serviceData.brand === "Others"
                        ? serviceData.customBrand
                        : serviceData.brand}
                    </p>
                  </div>
                )}
                {serviceData.model && (
                  <div>
                    <label className="text-sm text-gray-600">Model</label>
                    <p className="font-medium text-gray-900">
                      {serviceData.model}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Service Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Informasi Service
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-600">
                    Deskripsi Kerusakan
                  </label>
                  <p className="font-medium text-gray-900 whitespace-pre-wrap mt-1">
                    {serviceData.damage}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tanggal Service</label>
                  <p className="font-medium text-gray-900">
                    {format(new Date(serviceData.date), "dd MMMM yyyy", {
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            </section>

            {/* Device Images */}
            {serviceData.images.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Foto Kerusakan
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {serviceData.images.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-square relative rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={url}
                        alt={`Damage ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="text-center pt-8 border-t mt-8">
              <p className="text-gray-600">
                Terima kasih telah mempercayakan service perangkat Anda kepada kami
              </p>
              <p className="text-gray-600 mt-2">
                Jika ada pertanyaan, silakan hubungi kami di{" "}
                <a
                  href="tel:+6281234567890"
                  className="text-primary hover:underline"
                >
                  0812-3456-7890
                </a>
              </p>
            </footer>
          </div>
        </Card>
      </div>
    </div>
  );
}