import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/src/components/ui/alert-dialog";
import { Badge } from "@/src/components/ui/badge";
import { Calendar, Printer, QrCode } from "lucide-react";

interface ServiceReceiptProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  serviceData: {
    queueNumber: string;
    phoneNumber: string;
    customerName: string;
    deviceType: string;
    brand?: string;
    model: string;
    damageDescription: string;
    serviceDate: string;
    estimatedCompletionDate: string;
  };
}

export function ServiceReceipt({ 
  isOpen, 
  onOpenChange, 
  serviceData 
}: ServiceReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <AlertDialogHeader>
          <div className="flex justify-between items-center">
            <AlertDialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Bukti Pendaftaran Service
            </AlertDialogTitle>
            <Badge variant="secondary" className="text-sm">
              #{serviceData.phoneNumber}
            </Badge>
          </div>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300 space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>Tanggal Daftar: {serviceData.serviceDate}</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 border-t border-b py-4 border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Pelanggan</p>
              <p className="font-semibold">{serviceData.customerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jenis Perangkat</p>
              <p className="font-semibold">{serviceData.deviceType}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {serviceData.brand && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Merek</p>
                <p className="font-semibold">{serviceData.brand}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Model</p>
              <p className="font-semibold">{serviceData.model}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deskripsi Kerusakan</p>
            <p className="font-semibold">{serviceData.damageDescription}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimasi Selesai</p>
            <p className="font-semibold text-primary">{serviceData.estimatedCompletionDate}</p>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-4 mt-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <QrCode className="w-16 h-16 text-gray-500" />
          </div>
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Tutup</AlertDialogCancel>
          <AlertDialogAction onClick={handlePrint} className="flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}