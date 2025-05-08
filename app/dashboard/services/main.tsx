"use client";
import React, { useEffect, useState } from "react";
import DashboardService from "@/src/servercomponents/dashboard/services/DashboardService";
import { auth, db } from "@/src/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

type AllowedRoles = "admin" | "teknisi";

function DashboardServicePage() {
  const [user, loading, error] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string>("");
  const [checkingRole, setCheckingRole] = useState(true);
  const router = useRouter();

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
      <DashboardService />
    </>
  );
}

export default DashboardServicePage;
