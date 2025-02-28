import ProfileForm from "./main";
import type { Metadata } from "next";
import Layout from "@/src/layout/layout";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <Layout>
      <ProfileForm />
    </Layout>
  );
}
