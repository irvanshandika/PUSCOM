"use client";
import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { toast } from "react-hot-toast";

interface UserData {
  id: string;
  displayName: string;
  email: string;
  roles: "user" | "admin";
  photoURL?: string;
}

function TotalUsers() {
  const [users, setUsers] = useState<UserData[]>([]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      const usersList = usersSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as UserData
      );

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data pengguna");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div className="p-6 rounded-xl shadow-md flex items-center text-blue-500 bg-blue-50 transition-transform hover:scale-105">
        <div className="mr-4 p-3 rounded-full bg-white/30">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-75">Total Pengguna</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
      </div>
    </>
  );
}

export default TotalUsers;