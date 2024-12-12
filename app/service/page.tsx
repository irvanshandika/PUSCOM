import React from "react";
import Navbar from "@/src/components/Navbar";
import ServicePage from "./main";
import Footer from "@/src/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formulir Pengajuan Service Perangkat",
};

function Service() {
  return (
    <>
      <Navbar />
      <ServicePage />
      <Footer />
    </>
  );
}

export default Service;
