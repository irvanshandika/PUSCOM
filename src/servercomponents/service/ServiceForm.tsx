/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, storage, auth } from "@/src/config/FirebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import { X, Upload, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { Textarea } from "@/src/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRouter } from "next/navigation";

const serviceRequestSchema = z.object({
  uid: z.string(),
  name: z.string().min(1, "Nama harus diisi"),
  phoneNumber: z
    .string()
    .min(1, "Nomor HP harus diisi")
    .regex(/^[0-9+\-\s()]*$/, "Format nomor HP tidak valid"),
  email: z.string().min(1, "Email harus diisi").email("Format email tidak valid"),
  deviceType: z.enum(["Laptop", "Komputer"], {
    required_error: "Pilih jenis perangkat",
  }),
  computerTypes: z.enum(["All in One", "Gaming", "Desktop", "Mini PC", "Workstation"]).optional(),
  brand: z.enum(["Asus", "Acer", "Lenovo", "HP", "Dell", "Apple", "MSI", "Samsung", "Fujitsu", "LG", "Toshiba", "Razer", "Alienware", "Others"]).optional(),
  customBrand: z.string().optional(),
  status: z.string().optional(),
  model: z.string().optional(),
  damage: z.string().min(1, "Deskripsi kerusakan harus diisi"),
  date: z.string().min(1, "Tanggal service harus diisi"),
  images: z.array(z.string()),
});

type ServiceRequestSchema = z.infer<typeof serviceRequestSchema>;

export default function ServiceRequest() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const route = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const form = useForm<ServiceRequestSchema>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      uid: "",
      name: "",
      phoneNumber: "",
      email: "",
      deviceType: undefined,
      status: "pending",
      model: "",
      damage: "",
      date: "",
      images: [],
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error("Silakan login terlebih dahulu");
          route.push("/auth/signin");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          form.reset({
            ...form.getValues(),
            uid: currentUser.uid,
            name: userData.displayName,
            email: userData.email,
            phoneNumber: userData.phoneNumber || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Gagal memuat data pengguna");
      }
    };

    fetchUserData();
  }, [form, route]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (previewUrls.length + acceptedFiles.length > 5) {
        toast.error("Maksimal 5 gambar yang dapat diunggah");
        return;
      }

      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`File ${file.name} melebihi batas 20MB`);
          return false;
        }
        return true;
      });

      setUploadedFiles((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrls((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    [previewUrls]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  const removeImage = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const goToNextStep = () => {
    if (step === 1) {
      const personalInfoFields = ["name", "phoneNumber", "email"];
      const isValid = personalInfoFields.every(field => {
        const result = form.trigger(field as any);
        return result;
      });
      
      if (isValid) {
        setStep(2);
      }
    } else if (step === 2) {
      const deviceInfoFields = ["deviceType"];
      if (form.getValues("deviceType") === "Komputer") {
        deviceInfoFields.push("computerTypes");
      } else if (form.getValues("deviceType") === "Laptop") {
        deviceInfoFields.push("brand");
        if (form.getValues("brand") === "Others") {
          deviceInfoFields.push("customBrand");
        }
      }
      
      const isValid = deviceInfoFields.every(field => {
        const result = form.trigger(field as any);
        return result;
      });
      
      if (isValid) {
        setStep(3);
      }
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: ServiceRequestSchema) => {
    if (!executeRecaptcha) {
      toast.error("reCAPTCHA belum siap");
      return;
    }
    try {
      setIsSubmitting(true);
      const token = await executeRecaptcha("service_form");
      const verifyResponse = await fetch("/api/recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error("reCAPTCHA verification failed");
      }
      const imageUrls: string[] = [];

      for (const file of uploadedFiles) {
        const storageRef = ref(storage, `service-requests/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      const serviceRef = collection(db, "service_requests");
      const docRef = await addDoc(serviceRef, {
        ...data,
        images: imageUrls,
        createdAt: new Date(),
      });

      toast.success("Permintaan servis berhasil dikirim!");
      route.push(`/receipt/${docRef.id}`);
      form.reset();
      setUploadedFiles([]);
      setPreviewUrls([]);
      setShowDialog(false);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "reCAPTCHA verification failed":
            toast.error("Verifikasi keamanan gagal. Silakan coba lagi.");
            break;
          default:
            toast.error("Terjadi kesalahan saat mengirim pengajuan servis");
            break;
        }
      }
      toast.error("Terjadi kesalahan saat mengirim permintaan");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center w-full max-w-md">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full font-medium transition-all ${
                  s === step ? "bg-primary text-primary-foreground" : 
                  s < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? "bg-primary/60" : "bg-muted"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <Card className="max-w-3xl mx-auto shadow-sm border-0 rounded-xl overflow-hidden">
        <CardHeader className="pb-2 border-b bg-muted/30">
          <CardTitle className="text-xl font-medium">Form Permintaan Service</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          {renderStepIndicator()}
          
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                setShowDialog(true);
                onSubmit(data);
              })}
              className="space-y-6"
            >
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium mb-4">Informasi Pribadi</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="disabled:cursor-not-allowed disabled:opacity-70" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor HP</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} disabled className="disabled:cursor-not-allowed disabled:opacity-70" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} disabled className="disabled:cursor-not-allowed disabled:opacity-70" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="button" 
                      onClick={goToNextStep}
                      className="flex items-center gap-1.5"
                    >
                      Lanjut <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Device Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium mb-4">Informasi Perangkat</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="deviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Perangkat</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih jenis perangkat" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Laptop">Laptop</SelectItem>
                              <SelectItem value="Komputer">Komputer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("deviceType") === "Komputer" && (
                      <FormField
                        control={form.control}
                        name="computerTypes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipe Komputer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih tipe komputer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="All in One">All in One</SelectItem>
                                <SelectItem value="Gaming">Gaming</SelectItem>
                                <SelectItem value="Desktop">Desktop</SelectItem>
                                <SelectItem value="Mini PC">Mini PC</SelectItem>
                                <SelectItem value="Workstation">Workstation</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("deviceType") === "Laptop" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Merek</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih merek laptop" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent position="item-aligned">
                                  <SelectItem value="Asus">Asus</SelectItem>
                                  <SelectItem value="Acer">Acer</SelectItem>
                                  <SelectItem value="Lenovo">Lenovo</SelectItem>
                                  <SelectItem value="HP">HP</SelectItem>
                                  <SelectItem value="Dell">Dell</SelectItem>
                                  <SelectItem value="Apple">Apple</SelectItem>
                                  <SelectItem value="MSI">MSI</SelectItem>
                                  <SelectItem value="Samsung">Samsung</SelectItem>
                                  <SelectItem value="Fujitsu">Fujitsu</SelectItem>
                                  <SelectItem value="LG">LG</SelectItem>
                                  <SelectItem value="Toshiba">Toshiba</SelectItem>
                                  <SelectItem value="Razer">Razer</SelectItem>
                                  <SelectItem value="Alienware">Alienware</SelectItem>
                                  <SelectItem value="Others">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("brand") === "Others" && (
                          <FormField
                            control={form.control}
                            name="customBrand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Merek Lainnya</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  <div className="pt-4 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep}
                    >
                      Kembali
                    </Button>
                    <Button 
                      type="button" 
                      onClick={goToNextStep}
                      className="flex items-center gap-1.5"
                    >
                      Lanjut <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Service Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium mb-4">Detail Service</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block">Foto Kerusakan</Label>
                      <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer hover:bg-muted/40
                          ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}`}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drag & drop gambar disini, atau klik untuk memilih
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Maksimal 5 gambar, ukuran per file 20MB
                          </p>
                        </div>
                      </div>

                      {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group rounded-lg overflow-hidden">
                              <Image 
                                src={url} 
                                alt={`Preview ${index + 1}`} 
                                className="w-full h-28 object-cover transition-transform group-hover:scale-105" 
                                width={0} 
                                height={0} 
                              />
                              <button 
                                type="button" 
                                onClick={() => removeImage(index)} 
                                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="damage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi Kerusakan</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="min-h-32 resize-none"
                              placeholder="Jelaskan kerusakan yang dialami perangkat..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Service</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep}
                    >
                      Kembali
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="min-w-36"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim Permintaan"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Konfirmasi Data</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="text-sm text-muted-foreground mb-4">Pastikan data yang Anda masukkan sudah benar:</p>
              <div className="p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="col-span-2 font-medium">{form.getValues("name")}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Nomor HP</span>
                  <span className="col-span-2 font-medium">{form.getValues("phoneNumber")}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Email</span>
                  <span className="col-span-2 font-medium">{form.getValues("email")}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Jenis Perangkat</span>
                  <span className="col-span-2 font-medium">{form.getValues("deviceType")}</span>
                </div>
                {form.getValues("computerTypes") && (
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Tipe Komputer</span>
                    <span className="col-span-2 font-medium">{form.getValues("computerTypes")}</span>
                  </div>
                )}
                {form.getValues("brand") && (
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Merek</span>
                    <span className="col-span-2 font-medium">
                      {form.getValues("brand") === "Others" 
                        ? form.getValues("customBrand") 
                        : form.getValues("brand")}
                    </span>
                  </div>
                )}
                {form.getValues("model") && (
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Model</span>
                    <span className="col-span-2 font-medium">{form.getValues("model")}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Tanggal Service</span>
                  <span className="col-span-2 font-medium">{form.getValues("date")}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isSubmitting} className="border-0 bg-muted">Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} className="min-w-36">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Konfirmasi"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}