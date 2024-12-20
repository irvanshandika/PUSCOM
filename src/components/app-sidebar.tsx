import * as React from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/src/components/ui/sidebar";
import { LayoutGrid, Users, Package, Computer } from "lucide-react";
import Link from "next/link";

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],

  sidebarItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      label: "Produk",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Servis",
      href: "/dashboard/services",
      icon: Computer,
    },
    {
      label: "Pengguna",
      href: "/dashboard/users",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/" className="text-2xl font-bold text-white">
          PUSCOM
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {data.sidebarItems.map((item) => (
          <SidebarGroup key={item.label}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="flex items-center space-x-2">
                    <a href={item.href} className="flex items-center">
                      <item.icon className="mr-2 w-5 h-5" />
                      {item.label}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
