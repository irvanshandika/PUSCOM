/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Settings, Menu, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function handleNavigation() {
    setIsMobileMenuOpen(false);
  }

  function NavItem({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);

    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          isActive ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
        }`}>
        <Icon className={`h-4 w-4 mr-3 flex-shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
        <div className="h-full flex flex-col">
          <Link href="/" rel="noopener noreferrer" className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-center -space-x-3">
              <span className="h-6 aspect-square bg-blue-600 dark:bg-blue-500 rounded-full flex" />
              <span className="h-6 aspect-square bg-pink-600 dark:bg-pink-400 blur rounded-full flex" />
            </div>
            <span className="text-lg text-gray-700 dark:text-gray-300">PUSCOM</span>
          </Link>

          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <NavItem href="/settings/profile" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="/history" icon={History}>
                Histori
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  );
}
