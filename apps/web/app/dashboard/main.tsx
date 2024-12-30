"use client";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "@/src/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import TotalUsers from "@/src/servercomponents/dashboard/dashboard/TotalUsers";
import TotalServices from "@/src/servercomponents/dashboard/dashboard/TotalServices";
import TotalProducts from "@/src/servercomponents/dashboard/dashboard/TotalProducts";

const activities = [
  {
    title: "Konsultasi Baru",
    description: "Pengguna baru memulai konsultasi",
    time: "5 menit yang lalu",
  },
  {
    title: "Materi Ditambahkan",
    description: "Materi komputer baru telah diupload",
    time: "1 jam yang lalu",
  },
];
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Konsultasi */}
                <TotalServices />
                {/* Total pengguna */}
                <TotalUsers />
                {/* Total Produk */}
                <TotalProducts />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Aktivitas Terkini</h2>
                  {activities.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Ringkasan</h2>
                  {/* Konten ringkasan tambahan */}
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
