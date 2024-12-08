/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import dynamic from "next/dynamic";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar } from "@/src/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { db, storage } from "@/src/config/FirebaseConfig";
import { ImagePlus, Upload } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-markdown-editor").then((mod) => mod.default), { ssr: false });

const serviceFormSchema = z.object({
  name: z.string().min(2, "Nama lengkap harus diisi"),
  phoneNumber: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Nomor telepon tidak valid"),
  images: z.array(z.instanceof(File)).optional(),
  deviceType: z.enum(["Laptop", "Komputer", "Tablet", "Printer"]),
  brand: z.string().min(1, "Brand harus dipilih"),
  customBrand: z.string().optional(),
  model: z.string().optional(),
  computerType: z.string().optional(),
  date: z.date(),
  damage: z.string().min(10, "Deskripsi kerusakan minimal 10 karakter"),
});

type ServiceFormData = z.infer<typeof serviceFormSchema> & {
  images?: File[];
};

export function ServiceForm() {
  const [images, setImages] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      deviceType: "Laptop",
      date: new Date(),
    },
  });

  const deviceType = watch("deviceType");
  const brand = watch("brand");

  const validateImage = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error("Hanya mendukung file JPEG, PNG, dan GIF");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 5MB");
      return false;
    }

    return true;
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter(validateImage);

      const newImages = [...images, ...validFiles].slice(0, 5);

      setImages(newImages);
      setValue("images", newImages);
    },
    [images, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `service-images/${Date.now()}_${image.name}`);
          const snapshot = await uploadBytes(storageRef, image);
          return await getDownloadURL(snapshot.ref);
        })
      );

      const submissionData = {
        ...data,
        imageUrls,
        createdAt: new Date(),
        status: "Menunggu Konfirmasi",
      };

      const docRef = doc(db, "service_requests", `request_${Date.now()}`);
      await setDoc(docRef, submissionData);

      toast.success("Pengajuan service berhasil!");
      setImages([]);
      reset();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Gagal mengirim pengajuan service");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(() => setShowConfirmDialog(true))} className="space-y-4">
      {/* Nama Lengkap */}
      <div>
        <Input {...register("name")} placeholder="Nama Lengkap" className="mb-2" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      {/* Nomor Telepon */}
      <div>
        <Input {...register("phoneNumber")} placeholder="Nomor Telepon" className="mb-2" type="tel" />
        {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
      </div>

      {/* Jenis Perangkat */}
      <Controller
        name="deviceType"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Jenis Perangkat" />
            </SelectTrigger>
            <SelectContent>
              {["Laptop", "Komputer"].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {/* Brand dan Tipe Perangkat */}
      {(deviceType === "Laptop" || deviceType === "Komputer") && (
        <>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Brand" />
                </SelectTrigger>
                <SelectContent>
                  {deviceType === "Laptop"
                    ? ["Asus", "Acer", "Lenovo", "HP", "Dell", "Apple", "MSI", "Others"]
                    : ["Dell", "HP", "Lenovo", "Acer", "Asus", "Apple", "Custom Built", "Others"].map((brandName) => (
                        <SelectItem key={brandName} value={brandName}>
                          {brandName}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            )}
          />

          {brand === "Others" && (
            <>
              <Input {...register("customBrand")} placeholder={deviceType === "Laptop" ? "Masukkan Brand Laptop Lainnya" : "Masukkan Brand Komputer Lainnya"} className="mb-4" />
            </>
          )}

          {deviceType === "Laptop" && <Input {...register("model")} placeholder="Model Laptop" className="mb-4" />}

          {deviceType === "Komputer" && (
            <Controller
              name="computerType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe Komputer" />
                  </SelectTrigger>
                  <SelectContent>
                    {["All in One", "Gaming", "Desktop", "Mini PC", "Workstation"].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </>
      )}

      {/* Deskripsi Kerusakan */}
      <div className="mb-4">
        <Controller name="damage" control={control} render={({ field }) => <MDEditor value={field.value} onChange={(value) => field.onChange(value)} height="200px" placeholder="Deskripsikan detail kerusakan" />} />
        {errors.damage && <p className="text-red-500 text-sm mt-1">{errors.damage.message}</p>}
      </div>

      {/* Upload Gambar */}
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`
                              p-6 border-2 border-dashed rounded-lg text-center cursor-pointer
                              transition-colors duration-300
                              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"}
                            `}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">{isDragActive ? "Lepaskan file di sini" : "Seret & lepas gambar atau klik untuk memilih"}</p>
            <p className="text-xs text-gray-500 mt-2">Maksimal 5 gambar (JPEG, PNG, GIF) - Maks 5MB per file</p>
          </div>
        </div>

        <div className="flex gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img src={URL.createObjectURL(image)} alt={`Upload ${index}`} className="w-20 h-20 object-cover rounded" />
              <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs">
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tanggal Service */}
      <Controller name="date" control={control} render={({ field }) => <Calendar mode="single" selected={field.value} onSelect={(date) => field.onChange(date)} className="rounded-md border" />} />

      {/* Tombol Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Mengirim..." : "Ajukan Service"}
      </Button>

      {/* Konfirmasi Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengajuan Service</AlertDialogTitle>
            <AlertDialogDescription>Pastikan semua data yang Anda masukkan sudah benar. Apakah Anda yakin ingin mengirimkan pengajuan service?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batalkan</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              Ya, Kirim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Validasi */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error Validasi: </strong>
          <ul>
            {Object.entries(errors).map(([key, error]) => (
              <li key={key} className="text-sm">
                {key}: {error?.message?.toString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

ServiceForm.metadata = {
  title: "Formulir Pengajuan Service Perangkat",
  description: "Form komprehensif untuk pengajuan service elektronik",
  keywords: ["service elektronik", "perbaikan laptop", "formulir service", "teknisi komputer"],
};

export default ServiceForm;
