import React from "react";
import SignUpPage from "./main";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

function SignUp() {
  return (
    <>
      <SignUpPage />
    </>
  );
}

export default SignUp;
