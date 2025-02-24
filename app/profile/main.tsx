"use client";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/src/config/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/forbidden");
    } else if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setPhotoURL(user.photoURL || "");
      setPhotoPreview(user.photoURL || "");
      
      // Fetch user's sign type from Firestore
      const fetchSignType = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setSignType(userDoc.data().signType);
        }
      };
      fetchSignType();
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
    if (user) {
      try {
        let newPhotoURL = photoURL;

        if (photoPreview && photoPreview !== user.photoURL) {
          const file = (document.getElementById("photo") as HTMLInputElement).files?.[0];
          if (file) {
            const storageRef = ref(storage, `profileImages/${user.uid}`);
            await uploadBytes(storageRef, file);
            newPhotoURL = await getDownloadURL(storageRef);
          }
        }

        await updateDoc(doc(db, "users", user.uid), {
          displayName,
          email,
          photoURL: newPhotoURL,
        });

        toast.success("Profile updated successfully.", {
          icon: "🚀",
          duration: 3000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (err) {
        toast.error("Error updating profile. Please try again.");
        console.error(err);
      }
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
              <Image src={photoPreview} alt="Profile Preview" className="rounded-full w-32 h-32 object-cover" width={0} height={0} />
            ) : (
              <div className="bg-gray-200 rounded-full w-32 h-24 flex items-center justify-center text-gray-400 text-2xl">
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
            <input type="text" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          {/* Only show password field for credential users */}
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;