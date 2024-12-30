/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { auth, db } from "@/src/config/FirebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const checkUserExists = async (email: string) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const onSubmit = async (data: SignInFormData) => {
    const loadingToast = toast.loading("Sedang memproses...");
    try {
      const userExists = await checkUserExists(data.email);

      if (!userExists) {
        toast.dismiss(loadingToast);
        toast.error(`Maaf, akun ${data.email} belum terdaftar.`);
        return;
      }

      await signInWithEmailAndPassword(auth, data.email, data.password);

      toast.dismiss(loadingToast);
      toast.success("Berhasil masuk!");
      router.push("/");
    } catch (error: any) {
      toast.dismiss(loadingToast);

      if (error.code === "auth/wrong-password") {
        toast.error("Password yang Anda masukkan salah");
      } else if (error.code === "auth/user-not-found") {
        toast.error("Email tidak ditemukan");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Terlalu banyak percobaan. Silakan coba lagi nanti");
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi");
      }
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    const loadingToast = toast.loading("Sedang memproses...");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userExists = await checkUserExists(result.user.email!);

      if (!userExists) {
        await auth.signOut();
        toast.dismiss(loadingToast);
        toast.error(`Maaf, akun ${result.user.email} belum terdaftar.`);
        return;
      }

      toast.dismiss(loadingToast);
      toast.success(`Selamat datang, ${result.user.displayName}!`);
      router.push("/");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Proses login dibatalkan");
      } else {
        toast.error("Terjadi kesalahan saat login dengan Google");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Selamat Datang</h1>
          <p className="text-gray-600 dark:text-gray-300">Masuk ke akun PUSCOM Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email" className="block mb-2 text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input id="email" type="email" placeholder="Masukkan email Anda" className="pl-10" {...register("email")} />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="block mb-2 text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Masukkan password" className="pl-10 pr-12" {...register("password")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Lupa Password?
            </Link>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-300">
            Belum punya akun?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline dark:text-blue-400">
              Daftar Sekarang
            </Link>
          </p>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Atau</span>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleGoogleSignIn}>
            <FcGoogle className="h-5 w-5 mr-2" />
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}
