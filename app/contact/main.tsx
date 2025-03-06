// pages/contact.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { contactSchema, ContactFormValues } from "@/src/schema/ContactSchema";
import toast from "react-hot-toast";
import { useGoogleReCaptcha, GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export default function ContactPage() {
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
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

      interface ReCaptchaVerifyResponse {
        success: boolean;
      }
      const verifyData = await verifyResponse.json() as ReCaptchaVerifyResponse;

      if (!verifyData.success) {
        throw new Error("reCAPTCHA verification failed");
      }

      await addDoc(collection(db, "contacts"), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      form.reset();
      toast.success("Pesan berhasil terkirim 🚀");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        switch (error.message) {
          case "reCAPTCHA verification failed":
            toast.error("Verifikasi keamanan gagal. Silakan coba lagi.");
            break;
          default:
            toast.error("Terjadi kesalahan saat mengirim pesan");
            break;
        }
      }
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <GoogleReCaptchaProvider
        reCaptchaKey={RECAPTCHA_SITE_KEY}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: "head",
          nonce: undefined,
        }}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Hubungi Kami</h1>
            <p className="mt-2 text-muted-foreground">Silakan isi form di bawah ini untuk menghubungi kami</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama anda" {...field} />
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
                      <Input type="email" placeholder="Masukkan email anda" {...field} />
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
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Masukkan nomor telepon anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesan</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tuliskan pesan anda" className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
              </Button>
            </form>
          </Form>

          <AlertDialog open={showError} onOpenChange={setShowError}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Error</AlertDialogTitle>
                <AlertDialogDescription>Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowError(false)}>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </GoogleReCaptchaProvider>
    </div>
  );
}