import React from "react";
import type { Metadata } from "next";
import ServiceReceiptPage from "./main";

export const metadata: Metadata = {
  title: "Service Receipt",
};

function ServiceReceipt() {
  return (
    <>
      <main className="min-h-screen bg-background p-4">
        <ServiceReceiptPage />
      </main>
    </>
  );
}

export default ServiceReceipt;
