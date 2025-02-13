import React from "react";
import type { Metadata } from "next";
import ServiceDashboardPage from "./main";
import Sidebar from "@/src/components/Sidebar";
import AIChatDashboard from "@/src/components/AIChatDashboard"

export const metadata: Metadata = {
  title: "Dashboard Servis",
};

function DashboardService() {
  return (
    <Sidebar>
      <ServiceDashboardPage />
      <AIChatDashboard />
    </Sidebar>
  );
}

export default DashboardService;
