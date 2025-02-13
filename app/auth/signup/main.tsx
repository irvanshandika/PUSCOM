/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/src/config/FirebaseConfig";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const route = useRouter();
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0"); // Hari (2 digit)
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Bulan (2 digit, Januari = 0)
    const year = date.getFullYear(); // Tahun (4 digit)
    return `${day}-${month}-${year}`; // Format DD-MM-YYYY
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCredentialSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const createdAtFormatted = formatDate(new Date());

      await updateProfile(userCredential.user, {
        displayName: formData.displayName,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=random`,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: formData.displayName,
        email: formData.email,
        signType: "credential",
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=random`,
        roles: "user",
        status: "active",
        createdAt: createdAtFormatted,
      });

      toast.success("Account created successfully");
      route.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const createdAtFormatted = formatDate(new Date());
      const result = await signInWithPopup(auth, provider);

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        signType: "google",
        photoUrl: result.user.photoURL,
        roles: "user",
        status: "active",
        createdAt: createdAtFormatted,
      });

      toast.success(`Welcome ${result.user.displayName}`);
      route.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Join PUSCOM to get started with our services</p>
        </div>

        {/* Error Message */}
        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm">{error}</div>}

        {/* Sign Up Form */}
        <form onSubmit={handleCredentialSignUp} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              value={formData.displayName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign up"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
          shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;