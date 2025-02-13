import React from "react";
import DashboardPage from "./main";
import type { Metadata } from "next";
import Sidebar from "@/src/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

function Dashboard() {
  return (
    <>
      <Sidebar>
        <DashboardPage />
      </Sidebar>
    </>
  );
}

export default Dashboard;
