"use client";
import React, { useState } from "react";
import { Mail, ArrowRight, Shield } from "lucide-react";
import { auth } from "@/src/config/FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-hot-toast";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface ReCaptchaResponse {
  success: boolean;
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

// Skema Zod untuk validasi
const resetPasswordSchema = z.object({
  email: z.string().min(1, { message: "Email tidak boleh kosong" }).email({ message: "Format email tidak valid" }),
});

// Tipe untuk form data
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Konfigurasi React Hook Form dengan Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!executeRecaptcha) {
      toast.error("reCAPTCHA belum siap");
      return;
    }

    try {
      // Eksekusi reCAPTCHA
      const token = await executeRecaptcha("reset_password");

      // Verifikasi token
      const verifyResponse = await fetch("/api/recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const verifyData = (await verifyResponse.json()) as ReCaptchaResponse;

      if (!verifyData.success) {
        throw new Error("reCAPTCHA verification failed");
      }

      // Kirim email reset password
      await sendPasswordResetEmail(auth, data.email);

      // Tampilkan toast sukses
      toast.success("Link reset password telah dikirim");

      // Redirect atau tampilkan halaman sukses
      setIsSubmitted(true);
    } catch (err) {
      // Penanganan error yang spesifik
      if (err instanceof Error) {
        switch (err.message) {
          case "reCAPTCHA verification failed":
            toast.error("Verifikasi keamanan gagal. Silakan coba lagi.");
            break;
          case "auth/user-not-found":
            setError("email", {
              type: "manual",
              message: "Email tidak terdaftar",
            });
            break;
          case "auth/too-many-requests":
            toast.error("Terlalu banyak percobaan. Silakan coba lagi nanti.");
            break;
          default:
            toast.error("Gagal mengirim email reset password");
        }
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-4">
          <Shield className="text-green-500 w-16 h-16" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Periksa Email Anda</h2>
        <p className="text-gray-600 dark:text-gray-300">Kami telah mengirimkan instruksi reset password ke email Anda. Silakan periksa kotak masuk (dan folder spam).</p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
          Kirim Ulang
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lupa Password</h1>
          <p className="text-gray-600 dark:text-gray-300">Masukkan email untuk mereset password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input type="email" placeholder="Masukkan email Anda" className="pl-10" {...register("email")} />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700  dark:bg-blue-500 dark:hover:bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Reset Password"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/signin" className="text-blue-600 hover:underline  dark:text-blue-400 text-sm">
            Kembali ke Halaman Login
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          <p>Pastikan menggunakan email yang terdaftar di akun Anda</p>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}>
      <ResetPasswordForm />
    </GoogleReCaptchaProvider>
  );
}
