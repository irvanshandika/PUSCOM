"use client";
import React, { useEffect, useState } from "react";
import { Computer } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { toast } from "react-hot-toast";

type Service = {
  id: string;
  name: string;
  email: string;
  brand: string;
  damage: string;
  deviceType: string;
  computerTypes: string;
  images: string[];
  model: string;
  phoneNumber: string;
  status: string;
};

function TotalServices() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "service_requests"));
      const serviceList = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Service
      );
      setServices(serviceList);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error fetching services");
    }
  };
  return (
    <>
      <div className="p-6 rounded-xl shadow-md flex items-center text-purple-500 bg-purple-50 transition-transform hover:scale-105">
        <div className="mr-4 p-3 rounded-full bg-white/30">
          <Computer className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-75">Total Servis</p>
          <p className="text-2xl font-bold">{services.length}</p>
        </div>
      </div>
    </>
  );
}

export default TotalServices;