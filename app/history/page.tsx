import React from "react";
import RiwayatPage from "./main";
import Layout from "@/src/components/user/layout"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ri",
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
