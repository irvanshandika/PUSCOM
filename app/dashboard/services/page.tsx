import React from "react";
import type { Metadata } from "next";
import ServiceDashboardPage from "./main";
import Sidebar from "@/src/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard Servis",
};

function DashboardService() {
  return (
    <Sidebar>
      <ServiceDashboardPage />
    </Sidebar>
  );
}

export default DashboardService;
