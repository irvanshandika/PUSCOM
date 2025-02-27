/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { ServiceRequest } from "@/src/types/service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { getAuth } from "firebase/auth"; // Import untuk mendapatkan info user yang login

export default function ServiceDashboardPage() {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    // Mendapatkan data user yang sedang login
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const fetchServices = async () => {
    try {
      const servicesRef = collection(db, "service_requests");
      const q = query(servicesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceRequest[];
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Gagal memuat data service");
    }
  };

  // Fungsi untuk menyimpan aktivitas terkini ke koleksi recent_activities
  const saveRecentActivity = async (activity: string, serviceId: string) => {
    try {
      if (user) {
        const recentActivityRef = collection(db, "recent_activities");
        await addDoc(recentActivityRef, {
          activity,
          serviceId,
          name,
          technicianName: user.displayName,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleStatusChange = async (name: string, newStatus: string) => {
    if (newStatus === "rejected") {
      setSelectedService(services.find((s) => s.id === name) || null);
      setShowRejectDialog(true);
      return;
    }

    try {
      setIsUpdating(true);
      const serviceRef = doc(db, "service_requests", name);
      await updateDoc(serviceRef, {
        status: newStatus,
      });

      // Menyimpan aktivitas terkini untuk status baru
      if (newStatus === "in_progress") {
        saveRecentActivity(`${user?.displayName} mengambil alih perbaikan ${name}`, name);
      } else if (newStatus === "completed") {
        saveRecentActivity(`${user?.displayName} telah menyelesaikan perbaikan ${name}`, name);
      }

      toast.success("Status berhasil diperbarui");
      fetchServices();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedService || !rejectReason) return;

    try {
      setIsUpdating(true);
      const serviceRef = doc(db, "service_requests", selectedService.id);
      await updateDoc(serviceRef, {
        status: "rejected",
        rejectedReason: rejectReason,
      });

      // Menyimpan aktivitas terkini untuk penolakan
      saveRecentActivity(`${user?.displayName} menolak perbaikan dengan alasan ${rejectReason}`, selectedService.id);

      toast.success("Service telah ditolak");
      setShowRejectDialog(false);
      setRejectReason("");
      fetchServices();
    } catch (error) {
      console.error("Error rejecting service:", error);
      toast.error("Gagal menolak service");
    } finally {
      setIsUpdating(false);
    }
  };

  const ServiceTable = ({ status }: { status?: string }) => {
    const filteredServices = status ? services.filter((service) => service.status === status) : services.filter((service) => !["in_progress", "completed", "rejected"].includes(service.status));

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Nomor HP</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal Service</TableHead>
            <TableHead className="text-right">Lainnya</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredServices.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.phoneNumber}</TableCell>
              <TableCell>
                <Select defaultValue={service.status} onValueChange={(value) => handleStatusChange(service.id, value)} disabled={service.status === "rejected" || service.status === "completed"}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" disabled className="disabled:cursor-not-allowed">
                      Pending
                    </SelectItem>
                    <SelectItem value="in_progress" disabled className="disabled:cursor-not-allowed">Terima</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="rejected">Tolak</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{format(new Date(service.date), "dd MMMM yyyy", { locale: id })}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedService(service);
                    setShowDetailDialog(true);
                  }}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dashboard Service</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Daftar Servis</TabsTrigger>
              <TabsTrigger value="in_progress">Sedang Dikerjakan</TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
              <TabsTrigger value="rejected">Tolak</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <ServiceTable status="active" />
            </TabsContent>

            <TabsContent value="in_progress">
              <ServiceTable status="in_progress" />
            </TabsContent>

            <TabsContent value="completed">
              <ServiceTable status="completed" />
            </TabsContent>

            <TabsContent value="rejected">
              <ServiceTable status="rejected" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Service</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>
                  <p className="font-medium">{selectedService.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nomor HP</p>
                  <p className="font-medium">{selectedService.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedService.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Perangkat</p>
                  <p className="font-medium">{selectedService.deviceType}</p>
                </div>
                {selectedService.computerTypes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tipe Komputer</p>
                    <p className="font-medium">{selectedService.computerTypes}</p>
                  </div>
                )}
                {selectedService.brand && (
                  <div>
                    <p className="text-sm text-muted-foreground">Merek</p>
                    <p className="font-medium">{selectedService.brand === "Others" ? selectedService.customBrand : selectedService.brand}</p>
                  </div>
                )}
                {selectedService.model && (
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{selectedService.model}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Deskripsi Kerusakan</p>
                <p className="font-medium whitespace-pre-wrap">{selectedService.damage}</p>
              </div>

              {selectedService.images.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Foto Kerusakan</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedService.images.map((url, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                        <Image src={url} alt={`Damage ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedService.rejectedReason && (
                <div>
                  <p className="text-sm text-muted-foreground">Alasan Penolakan</p>
                  <p className="font-medium text-red-500">{selectedService.rejectedReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penolakan Service</AlertDialogTitle>
            <AlertDialogDescription>Mohon berikan alasan penolakan service ini:</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Tuliskan alasan penolakan..." className="min-h-[100px]" />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isUpdating || !rejectReason} onClick={handleReject} className="bg-red-500 hover:bg-red-600">
              {isUpdating ? "Memproses..." : "Konfirmasi Penolakan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
