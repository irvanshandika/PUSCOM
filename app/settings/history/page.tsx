import React from "react";
import RiwayatPage from "./main";
import Layout from "@/src/layout/layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Histori",
};

function Riwayat() {
  return (
    <>
      <Layout>
        <RiwayatPage />
      </Layout>
    </>
  );
}

export default Riwayat;
