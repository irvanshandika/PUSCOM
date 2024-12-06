/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpFormData } from "@/src/schema/SignUpSchema";
import { PasswordStrengthIndicator } from "@/src/components/PasswordStrengthIndicator";
import { FcGoogle } from "react-icons/fc";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/src/config/FirebaseConfig";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const checkEmailExists = async (email: string) => {
    try {
      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const emailExistsQuery = await getDocs(query(collection(db, "users"), where("email", "==", data.email)));

      if (!emailExistsQuery.empty) {
        toast.error(`Maaf, email ${data.email} sudah terdaftar.`);
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: data.name,
        email: data.email,
        signType: "credential",
        roles: "user",
        hashedPassword: hashedPassword,
        createdAt: new Date(),
        photoURL: data.photoURL,
        phoneNumber: data.phoneNumber,
      });

      toast.success("Akun berhasil dibuat!");
      router.push("/");
    } catch (error: any) {
      console.error("Registrasi Gagal", error);
      toast.error("Gagal membuat akun. Silakan coba lagi.");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const emailExistsQuery = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));

      if (!emailExistsQuery.empty) {
        toast.error(`Maaf, email ${user.email} sudah terdaftar.`);
        await auth.signOut();
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName || "Pengguna Google",
        email: user.email,
        signType: "google",
        roles: "user",
        createdAt: new Date(),
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
      });

      toast.success("Akun Google berhasil dibuat!");
      router.push("/");
    } catch (error: any) {
      console.error("Google Sign Up Gagal", error);
      toast.error("Gagal mendaftar dengan Google");
    }
  };

  const passwordValue = watch("password") || "";

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buat Akun Baru</h1>
        <p className="text-gray-600 dark:text-gray-300">Daftar di PUSCOM untuk pengalaman lebih baik</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label className="block mb-2 text-gray-700 dark:text-gray-300">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400 dark:text-gray-500" />
            <Input required placeholder="Masukkin Nama" className="pl-10" {...register("name")} />
          </div>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label className="block mb-2 text-gray-700 dark:text-gray-300">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400 dark:text-gray-500" />
            <Input required type="email" placeholder="Masukkan email" className="pl-10" {...register("email")} />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label className="block mb-2 text-gray-700 dark:text-gray-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400 dark:text-gray-500" />
            <Input required type={showPassword ? "text" : "password"} placeholder="Buat password" className="pl-10 pr-12" {...register("password")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2  text-gray-400 hover:text-gray-600  dark:text-gray-500 dark:hover:text-gray-300">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

          <PasswordStrengthIndicator password={passwordValue} />

          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <CheckCircle2 className={`mr-2 h-4 w-4 ${passwordValue.length >= 8 ? "text-green-500" : "text-gray-300"}`} />
              Minimal 8 karakter
            </div>
            <div className="flex items-center">
              <CheckCircle2 className={`mr-2 h-4 w-4 ${/[A-Z]/.test(passwordValue) ? "text-green-500" : "text-gray-300"}`} />
              Mengandung huruf besar
            </div>
            <div className="flex items-center">
              <CheckCircle2 className={`mr-2 h-4 w-4 ${/[a-z]/.test(passwordValue) ? "text-green-500" : "text-gray-300"}`} />
              Mengandung huruf kecil
            </div>
            <div className="flex items-center">
              <CheckCircle2 className={`mr-2 h-4 w-4 ${/[0-9]/.test(passwordValue) ? "text-green-500" : "text-gray-300"}`} />
              Mengandung angka
            </div>
          </div>
        </div>

        <div>
          <Label className="block mb-2 text-gray-700 dark:text-gray-300">Konfirmasi Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400 dark:text-gray-500" />
            <Input required type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi password" className="pl-10 pr-12" {...register("confirmPassword")} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2  text-gray-400 hover:text-gray-600  dark:text-gray-500 dark:hover:text-gray-300">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="terms" className="mr-2 rounded text-blue-600 focus:ring-blue-500" required />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
            Saya menyetujui{" "}
            <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">
              Syarat & Ketentuan
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700  dark:bg-blue-500 dark:hover:bg-blue-600" disabled={isSubmitting}>
          {isSubmitting ? "Mendaftarkan..." : "Daftar Sekarang"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-300">
          Sudah punya akun?{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:underline  dark:text-blue-400">
            Masuk Sekarang
          </Link>
        </p>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Atau Daftar Dengan</span>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleGoogleSignUp}>
          <FcGoogle className="h-5 w-5 mr-2" />
          Google
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">Informasi Anda dilindungi dengan enkripsi 256-bit</p>
      </div>
    </>
  );
}
