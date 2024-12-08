import React from "react";
import ForgotPasswordPage from "./main";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
};

function ForgotPassword() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <ForgotPasswordPage />
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;