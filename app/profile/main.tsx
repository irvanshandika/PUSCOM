/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/src/config/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword } from "firebase/auth";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import bcrypt from "bcryptjs";

function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signType, setSignType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/forbidden");
    } else if (user) {
      // Set basic user data from Authentication
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "");
      setPhotoPreview(user.photoURL || "");

      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSignType(userData.signType);
          // Get phone number from Firestore
          setPhoneNumber(userData.phoneNumber || "");
        }
      };
      fetchUserData();
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("File size exceeds 10MB.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);

      let newPhotoURL = photoURL;

      // Handle photo upload
      if (photoPreview && photoPreview !== user.photoURL) {
        const file = (document.getElementById("photo") as HTMLInputElement).files?.[0];
        if (file) {
          const storageRef = ref(storage, `profileImages/${user.uid}`);
          await uploadBytes(storageRef, file);
          newPhotoURL = await getDownloadURL(storageRef);
        }
      }

      // Update user data in Firestore
      const updateData: any = {
        displayName,
        email,
        phoneNumber, // Make sure phoneNumber is included in the update
        photoURL: newPhotoURL,
      };

      // Handle password update for credential users
      if (signType === "credential" && password.trim()) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          await updatePassword(user, password);
          updateData.hashedPassword = hashedPassword;
          setPassword("");
          toast.success("Password updated successfully!");
        } catch (error: any) {
          toast.error("Error updating password. Please try again.");
          console.error("Password update error:", error);
          return;
        }
      }

      // Update user document
      await updateDoc(doc(db, "users", user.uid), updateData);

      toast.success("Profile updated successfully!", {
        icon: "🚀",
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      toast.error("Error updating profile. Please try again.");
      console.error("Profile update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <i className="fa fa-spinner fa-spin text-4xl"></i>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-extrabold mb-8">Edit Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            {photoPreview ? (
              <Image src={photoPreview} alt="Profile Preview" className="rounded-full w-32 h-32 object-cover" width={128} height={128} />
            ) : (
              <div className="bg-gray-200 rounded-full w-32 h-32 flex items-center justify-center text-gray-400 text-2xl">
                <i className="fa fa-user"></i>
              </div>
            )}
            <div className="w-full">
              <label className="block text-sm font-medium">Profile Photo</label>
              <input type="file" id="photo" accept="image/*" onChange={handleFileChange} className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {signType === "credential" && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Leave empty to keep current password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;