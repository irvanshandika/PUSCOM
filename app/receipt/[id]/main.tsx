"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/src/config/FirebaseConfig"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { ArrowLeft, Printer } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import { Skeleton } from "@/src/components/ui/skeleton"
import { cn } from "@/src/lib/utils"

interface ServiceData {
  name: string
  phoneNumber: string
  email: string
  deviceType: string
  computerTypes?: string
  brand?: string
  customBrand?: string
  model?: string
  damage: string
  date: string
  images: string[]
  createdAt: {
    seconds: number
    nanoseconds: number
  }
}

interface InfoItemProps {
  label: string
  value: string | undefined
  className?: string
}

const InfoItem = ({ label, value, className }: InfoItemProps) => {
  if (!value) return null
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  )
}

export default function ServiceReceipt() {
  const params = useParams()
  const router = useRouter()
  const [serviceData, setServiceData] = useState<ServiceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const docRef = doc(db, "service_requests", params.id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setServiceData(docSnap.data() as ServiceData)
        }
      } catch (error) {
        console.error("Error fetching service data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchServiceData()
    }
  }, [params.id])

  const handlePrintPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader className="space-y-4 items-center text-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!serviceData) {
    return (
      <div className="container max-w-3xl mx-auto p-4 md:p-8">
        <Card className="py-16">
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">Data tidak ditemukan</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 md:p-8 space-y-4">
      <div className="print:hidden flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrintPDF}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="text-center space-y-4 border-b">
          <Link
            href="/"
            className="mx-auto font-semibold flex items-center gap-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center -space-x-3">
              <span className="h-6 aspect-square bg-primary rounded-full flex" />
              <span className="h-6 aspect-square bg-pink-500 dark:bg-pink-400 blur rounded-full flex" />
            </div>
            <span className="text-lg">PUSCOM</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold mb-1">Service Receipt</h1>
            <p className="text-sm text-muted-foreground">No. #{params.id}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(serviceData.createdAt.seconds * 1000), "dd MMMM yyyy, HH:mm", {
                locale: id,
              })}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Customer Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informasi Pelanggan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Nama" value={serviceData.name} />
              <InfoItem label="Nomor HP" value={serviceData.phoneNumber} />
              <InfoItem label="Email" value={serviceData.email} className="md:col-span-2" />
            </div>
          </section>

          {/* Device Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informasi Perangkat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Jenis Perangkat" value={serviceData.deviceType} />
              <InfoItem label="Tipe Komputer" value={serviceData.computerTypes} />
              <InfoItem
                label="Merek"
                value={serviceData.brand === "Others" ? serviceData.customBrand : serviceData.brand}
              />
              <InfoItem label="Model" value={serviceData.model} />
            </div>
          </section>

          {/* Service Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informasi Service</h2>
            <div className="space-y-6">
              <InfoItem label="Deskripsi Kerusakan" value={serviceData.damage} />
              <InfoItem
                label="Tanggal Service"
                value={format(new Date(serviceData.date), "dd MMMM yyyy", { locale: id })}
              />
            </div>
          </section>

          {/* Device Images */}
          {serviceData.images.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Foto Kerusakan</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {serviceData.images.map((url, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square relative rounded-lg overflow-hidden",
                      "border border-border hover:border-primary transition-colors",
                    )}
                  >
                    <Image
                      src={url || "/placeholder.svg"}
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
          <footer className="text-center pt-8 border-t">
            <p className="text-muted-foreground">Terima kasih telah mempercayakan service perangkat Anda kepada kami</p>
            <p className="text-muted-foreground mt-2">
              Jika ada pertanyaan, silakan hubungi kami di{" "}
              <a href="tel:+6281234567890" className="hover:underline">
                0812-3456-7890
              </a>
            </p>
          </footer>
        </CardContent>
      </Card>
    </div>
  )
}