import React from "react";
import type { Metadata } from "next";
import Sidebar from "@/src/components/Sidebar";
import DashboardUsers from "./main";

export const metadata: Metadata = {
  title: "Dashboard Pengguna",
};

function Pengguna() {
  return (
    <Sidebar>
      <DashboardUsers />
    </Sidebar>
  );
}

export default Pengguna;
