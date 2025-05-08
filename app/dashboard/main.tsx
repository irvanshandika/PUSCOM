"use client";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "@/src/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ChartServicesComponent from "@/src/components/ChartServicesComponent";
import TotalProducts from "@/src/servercomponents/dashboard/dashboard/TotalProducts";
import TotalUsers from "@/src/servercomponents/dashboard/dashboard/TotalUsers";
import HistoriesActivitie from "@/src/servercomponents/dashboard/dashboard/HistoriesActivitie";

// Definisikan tipe untuk role yang diizinkan
type AllowedRoles = "admin" | "teknisi";

function DashboardPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string>("");
  const [checkingRole, setCheckingRole] = useState(true);
  const router = useRouter();

  // Array role yang diizinkan mengakses dashboard
  const allowedRoles: AllowedRoles[] = ["admin", "teknisi"];

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserRole(userData.roles);
            
            // Jika role tidak termasuk dalam allowedRoles, redirect ke forbidden
            if (!allowedRoles.includes(userData.roles as AllowedRoles)) {
              router.push("/forbidden");
            }
          } else {
            router.push("/forbidden");
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          router.push("/forbidden");
        } finally {
          setCheckingRole(false);
        }
      }
    };

    if (user) {
      checkUserRole();
    } else if (!loading) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Memeriksa hak akses...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Cek apakah role user termasuk dalam allowedRoles
  if (!allowedRoles.includes(userRole as AllowedRoles)) {
    router.push("/forbidden");
    return null;
  }

  return (
    <>
      <div className="flex">
        <main className="flex-1 p-8">
          <div className="container mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Selamat datang{" "}
                {userRole === "admin" ? "Administrator" : "Teknisi"}{" "}
                di panel kontrol Anda
              </p>
            </header>

            <div className="space-y-8">
              <ChartServicesComponent />
              
              {/* Tampilkan komponen berdasarkan role */}
              {userRole === "admin" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TotalUsers />
                  <TotalProducts />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HistoriesActivitie />

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4">
                    {userRole === "admin" ? "Ringkasan Admin" : "Ringkasan Teknisi"}
                  </h2>
                  {/* Tambahkan konten spesifik berdasarkan role */}
                  {userRole === "admin" ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      Panel kontrol untuk manajemen sistem
                    </p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">
                      Panel kontrol untuk manajemen service
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default DashboardPage;