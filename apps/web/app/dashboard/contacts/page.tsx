import React from "react";
import type { Metadata } from "next";
import ContactsDashboard from "./main";
import Sidebar from "@/src/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard Contacts",
};

function DashboardContacts() {
  return (
    <>
      <Sidebar>
        <ContactsDashboard />
      </Sidebar>
    </>
  );
}

export default DashboardContacts;
