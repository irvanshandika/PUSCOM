"use client";

import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { User, LogIn, UserPlus, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function UserDropdown() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Dropdown User">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-lg  border-none  bg-white dark:bg-gray-900  text-gray-800 dark:text-gray-200">
        <DropdownMenuLabel className="font-normal text-xs text-gray-500 dark:text-gray-400">Akun PUSCOM</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem onClick={() => router.push("/auth/signin")} className="cursor-pointer   hover:bg-gray-100 dark:hover:bg-gray-800   rounded-md transition-colors">
          <LogIn className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
          <span>Masuk</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/auth/signup")} className="cursor-pointer   hover:bg-gray-100 dark:hover:bg-gray-800   rounded-md transition-colors">
          <UserPlus className="mr-2 h-4 w-4 text-green-500 dark:text-green-400" />
          <span>Daftar</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer   hover:bg-gray-100 dark:hover:bg-gray-800   rounded-md transition-colors">
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Mode Terang</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Mode Gelap</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
