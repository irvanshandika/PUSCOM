/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";
import { collection, query, where, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/src/config/FirebaseConfig";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

interface ServiceRequest {
  id: string;
  deviceType: string;
  computerTypes?: string;
  brand?: string;
  customBrand?: string;
  model?: string;
  damage: string;
  date: string;
  status: string;
  createdAt: Date;
}

export default function ServiceHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceHistory, setServiceHistory] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        router.push("/forbidden");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchServiceHistory = async () => {
      try {
        setLoading(true);
        const serviceRef = collection(db, "service_requests");

        // Buat query tanpa orderBy untuk menghindari kebutuhan index
        const q = query(serviceRef, where("uid", "==", user.uid));

        // Gunakan onSnapshot untuk real-time updates
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const services: ServiceRequest[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              services.push({
                id: doc.id,
                deviceType: data.deviceType,
                computerTypes: data.computerTypes,
                brand: data.brand,
                customBrand: data.customBrand,
                model: data.model,
                damage: data.damage,
                date: data.date,
                status: data.status,
                createdAt: data.createdAt?.toDate() || new Date(),
              });
            });

            // Sort data di client side
            services.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setServiceHistory(services);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching service history:", error);
            toast.error("Gagal memuat riwayat servis");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up service history listener:", error);
        toast.error("Gagal memuat riwayat servis");
        setLoading(false);
      }
    };

    fetchServiceHistory();
  }, [user]);

  const getDeviceName = (service: ServiceRequest) => {
    if (service.deviceType === "Komputer") {
      return `Komputer ${service.computerTypes || ""}`;
    } else {
      const brandName = service.brand === "Others" ? service.customBrand : service.brand;
      return `${service.deviceType} ${brandName || ""} ${service.model || ""}`.trim();
    }
  };

  const filteredHistory = serviceHistory.filter((item) => {
    const searchString = searchTerm.toLowerCase();
    const deviceName = getDeviceName(item).toLowerCase();
    const damage = item.damage.toLowerCase();
    const date = item.date.toLowerCase();
    const status = item.status.toLowerCase();

    return deviceName.includes(searchString) || damage.includes(searchString) || date.includes(searchString) || status.includes(searchString);
  });

  const handleViewDetail = (serviceId: string) => {
    router.push(`/receipt/${serviceId}`);
  };

  const handlePrintReceipt = (serviceId: string) => {
    router.push(`/receipt/${serviceId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-500";
      case "proses":
        return "text-blue-500";
      case "selesai":
        return "text-green-500";
      case "ditolak":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Silakan login terlebih dahulu</h2>
        <Link href="/auth/signin">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Riwayat Servis</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input type="search" placeholder="Cari riwayat servis..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {serviceHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Anda belum memiliki riwayat servis</p>
          <Link href="/service">
            <Button>Ajukan Servis Baru</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perangkat</TableHead>
                <TableHead>Kerusakan</TableHead>
                <TableHead>Tanggal Pengajuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{getDeviceName(item)}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.damage}</TableCell>
                  <TableCell>{format(new Date(item.date), "dd MMMM yyyy", { locale: id })}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(item.status)}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetail(item.id)}>Lihat Detail</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrintReceipt(item.id)}>Cetak Resi</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            toast.error("Fitur dalam pengembangan");
                          }}>
                          Hubungi Teknisi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
