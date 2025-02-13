import React from "react";
import Navbar from "@/src/components/Navbar";
import ContactPage from "./main";
import Footer from "@/src/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak Kami",
};

function Contact() {
  return (
    <>
        <Navbar />
      <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8">
        <ContactPage />
      </div>
        <Footer />
    </>
  );
}

export default Contact;