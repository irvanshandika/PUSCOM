/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import Image from "next/image";
import { Bell } from "lucide-react";
import Profile01 from "./Profile";
import { useEffect, useState } from "react";
import { app } from "@/src/config/FirebaseConfig";
import { getAuth } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const authInstance = getAuth(app);
    const unsubscribe = authInstance.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]"></div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            {user && user.photoURL ? (
              <>
                <Image src={user?.photoURL} alt={user?.displayName || "Pengguna"} width={28} height={28} className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer" />
              </>
            ) : (
              <>
                <Image
                  src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                  alt={user?.displayName || "Pengguna"}
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer"
                />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg">
            <Profile01 />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
