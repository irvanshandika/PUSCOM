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

function DashboardPage() {
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.roles === "admin");
        }
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.roles === "teknisi");
        } else {
          setIsAdmin(false);
        }
        setCheckingRole(false);
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

  if (!isAdmin) {
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
              <p className="text-gray-600 dark:text-gray-300">Selamat datang di panel kontrol Anda</p>
            </header>

            <div className="space-y-8">
              <ChartServicesComponent />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TotalUsers />
                <TotalProducts />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HistoriesActivitie />

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Ringkasan</h2>
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
