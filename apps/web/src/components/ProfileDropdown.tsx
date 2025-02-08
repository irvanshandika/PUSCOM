/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { app } from "@/src/config/FirebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, History, Settings, LogOut, Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";

export default function ProfileDropdown() {
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const auth = getAuth();
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      router.push("/");
      toast.success(`Sampai Jumpa, ${user?.displayName || "Pengguna"}!`, {
        style: {
          background: theme === "dark" ? "#444" : "#333",
          color: "#fff",
        },
      });
      await signOut(auth);
    } catch (error: any) {
      console.log("Error signing out: ", error.message);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-8 w-8 border-2 border-transparent hover:border-primary transition-all">
          {user && user.photoURL ? (
            <>
              <AvatarImage src={user.photoURL} className="w-full" alt="Profile" />
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </>
          ) : (
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <User className="w-4 h-4" />
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-neutral-900 shadow-md rounded-lg border-none py-2">
        <DropdownMenuLabel className="px-4 py-2 text-center">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.displayName || "Pengguna"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-neutral-700" />

        <DropdownMenuItem onClick={() => router.push("/dashboard")} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center">
          <LayoutDashboard className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm text-gray-800 dark:text-gray-200">Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/history")} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center">
          <History className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm text-gray-800 dark:text-gray-200">Riwayat</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/settings")} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center">
          <Settings className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm text-gray-800 dark:text-gray-200">Pengaturan</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-neutral-700" />

        <DropdownMenuItem onClick={toggleTheme} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center">
          {theme === "dark" ? <Sun className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" /> : <Moon className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />}
          <span className="text-sm text-gray-800 dark:text-gray-200">{theme === "dark" ? "Mode Terang" : "Mode Gelap"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLogout} className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
