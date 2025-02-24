import ProfileForm from "./main";
import type { Metadata } from "next";
import Layout from "@/src/components/user/layout";

export const metadata: Metadata = {
  title: "Profile | PUSCOM",
  description: "Manage your PUSCOM profile",
};

export default function ProfilePage() {
  return (
    <Layout>
      <ProfileForm />
    </Layout>
  );
}
