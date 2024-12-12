/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import ServiceForm from "@/src/servercomponents/service/ServiceForm";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";
import { app } from "@/src/config/FirebaseConfig";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export default function ServicePage() {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [email, setEmail] = useState("");

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || "");
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loadingAuth) {
    return <div className="flex items-center text-2xl font-semibold justify-center py-[25vh]">Memuat...</div>;
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-900 dark:text-gray-100  transition-colors duration-300 ease-in-out px-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="bg-red-100 dark:bg-red-900/30  rounded-full w-24 h-24  flex items-center justify-center  mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 
              text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold  text-gray-900 dark:text-gray-100">Akses Ditolak</h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">Anda perlu login terlebih dahulu untuk mengakses halaman ini.</p>

            <div className="flex justify-center space-x-4">
              <Button variant="default" size="lg" className="dark:bg-blue-600 dark:hover:bg-blue-700 text-white" onClick={() => router.push("/auth/signin")}>
                Login Sekarang
              </Button>
              <Button variant="outline" size="lg" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => router.push("/")}>
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
      <div className="max-w-2xl mx-auto">
      <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}>
        <h1 className="text-3xl font-bold mb-6 text-center">Layanan Service Laptop & Komputer</h1>
        <ServiceForm />
      </GoogleReCaptchaProvider>
      </div>
    </div>
  );
}
