import React from "react";
import SignUpPage from "./main";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

function SignUp() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <SignUpPage />
        </div>
      </div>
    </>
  );
}

export default SignUp;