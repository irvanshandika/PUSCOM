/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink, DropdownTitle } from "@/src/components/ui/sidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { app } from "@/src/config/FirebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LayoutGrid, Users, Package, Computer, Phone, ChevronDown, Settings, CreditCard, FileText, Globe, Link2, User, ChevronsUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Menu } from "@headlessui/react";

export default function SideBar({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Produk",
      href: "/dashboard/products",
      icon: <Package className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Servis",
      href: "/dashboard/services",
      icon: <Computer className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Pengguna",
      href: "/dashboard/users",
      icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Kontak",
      href: "/dashboard/messages",
      icon: <Phone className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ];
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
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

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className={cn("flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 flex-1 border border-neutral-200 dark:border-neutral-700")}>
        <Sidebar open={open} setOpen={setOpen} animate={false}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            <div>
              {user && user.photoURL ? (
                <>
                  <Menu as="div" className="relative w-full inline-flex">
                    <Menu.Button className="w-full inline-flex shrink-0 items-center gap-x-2 p-2 text-start text-sm text-gray-800 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                      <Image className="shrink-0 size-5 rounded-full" src={user.photoURL} alt={user.displayName} width={20} height={20} />
                      {user.displayName}
                      <ChevronsUpDown className="shrink-0 size-3.5 ms-auto" />
                    </Menu.Button>

                    <Menu.Items className="absolute bottom-full w-full mb-1 left-0 origin-bottom-left bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-neutral-900 dark:border-neutral-700 focus:outline-none">
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/settings/profile"
                              className={`flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 ${active ? "bg-gray-100 dark:bg-neutral-800" : ""} disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-300`}>
                              My account
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={`flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 ${active ? "bg-gray-100 dark:bg-neutral-800" : ""} disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-300`}>
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              onClick={async () => {
                                await signOut(auth);
                                router.push("/auth/login");
                              }}
                              className={`flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 ${active ? "bg-gray-100 dark:bg-neutral-800" : ""} disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-300`}>
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Menu>
                </>
              ) : (
                <>
                  <SidebarLink
                    link={{
                      label: `${user && user.displayName}`,
                      href: "#",
                      icon: <Users className="h-7 w-7 flex-shrink-0 rounded-full" />,
                    }}
                  />
                </>
              )}
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          <div className="p-2 md:p-10 rounded-tl-2xl flex flex-col gap-2 w-full min-h-full dark:bg-neutral-950">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link href="/" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <Image src="https://api.iconify.design/devicon:nextjs.svg" alt="Brand Logo" width={100} height={100} className="h-[50px] w-[50px] flex-shrink-0" />
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-black dark:text-white whitespace-pre">
        PUSCOM
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link href="/" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <Image src="https://api.iconify.design/devicon:nextjs.svg" alt="Brand Logo" width={100} height={100} className="h-7 w-7 flex-shrink-0" />
    </Link>
  );
};
