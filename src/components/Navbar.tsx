/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // Import useRouter and usePathname
import UserDropdown from "./UserDropdown";
import ProfileDropdown from "./ProfileDropdown";
import { auth, db } from "@/src/config/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const navItems = [
  {
    id: 1,
    text: "Home",
    link: "/",
  },
  {
    id: 2,
    text: "Katalog",
    link: "/catalog",
  },
  {
    id: 3,
    text: "Servis",
    link: "/service",
  },
  {
    id: 5,
    text: "Kontak",
    link: "/contact",
  },
];

const Navbar = () => {
  const [openNavbar, setOpenNavbar] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUserExists, setIsUserExists] = useState(false);

  const router = useRouter(); // Initialize router
  const currentPath = usePathname(); // Get current path

  const toggleNavbar = () => {
    setOpenNavbar((openNavbar) => !openNavbar);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        setIsUserExists(userDoc.exists());
      } else {
        setIsUserExists(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if the current link matches the active path
  const getLinkClass = (link: string) => {
    return currentPath === link ? "text-blue-600" : "text-gray-700 dark:text-gray-300";
  };

  return (
    <header className="absolute left-0 top-0 w-full flex items-center h-24 z-40">
      <nav className="relative mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 flex gap-x-5 justify-between items-center">
        <div className="flex items-center min-w-max relative">
          <Link href="/" className="font-semibold flex items-center gap-x-2">
            <div className="flex items-center -space-x-3">
              <span className="h-6 aspect-square bg-blue-600 dark:bg-blue-500 rounded-full flex" />
              <span className="h-6 aspect-square bg-pink-600 dark:bg-pink-400 blur rounded-full flex" />
            </div>
            <span className="text-lg text-gray-700 dark:text-gray-300">PUSCOM</span>
          </Link>
        </div>
        <div
          className={`fixed inset-x-0 h-[100dvh] lg:h-max top-0 lg:translate-y-0 lg:opacity-100 left-0 bg-white dark:bg-gray-950 lg:!bg-transparent py-32 lg:py-0 px-5 sm:px-10 md:px-12 lg:px-0 w-full lg:top-0 lg:relative lg:flex lg:justify-between duration-300 ease-linear
                ${openNavbar ? "" : " -translate-y-10 opacity-0 invisible lg:visible"}`}>
          <ul className="flex flex-col lg:flex-row gap-6 lg:items-center text-gray-700 dark:text-gray-300 lg:w-full lg:justify-center">
            {navItems.map((navItem) => (
              <li key={navItem.id}>
                <Link
                  href={navItem.link}
                  className={`relative py-2.5 duration-300 ease-linear hover:text-blue-600 ${getLinkClass(navItem.link)}`}
                >
                  {navItem.text}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:min-w-max mt-10 lg:mt-0">
            {user ? (
              <>
                <ProfileDropdown />
              </>
            ) : (
              <>
                <UserDropdown />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => {
              toggleNavbar();
            }}
            className="outline-none border-l border-l-purple-100 dark:border-l-gray-800 pl-3 relative py-3">
            <span className="sr-only">Toggle navbar</span>
            <span
              aria-hidden="true"
              className={`flex h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
                            ${openNavbar ? "rotate-45 translate-y-[0.33rem]" : ""}`}
            />
            <span
              aria-hidden="true"
              className={`flex mt-2 h-0.5 w-6 rounded bg-gray-800 dark:bg-gray-300 transition duration-300
                            ${openNavbar ? "-rotate-45 -translate-y-[0.33rem]" : ""}`}
            />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
