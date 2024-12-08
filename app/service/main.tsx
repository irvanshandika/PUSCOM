"use client";

import ServiceForm from "@/src/servercomponents/service/ServiceForm";
import { Toaster } from "react-hot-toast";

export default function ServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Layanan Service Laptop & Komputer</h1>
        <ServiceForm />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
