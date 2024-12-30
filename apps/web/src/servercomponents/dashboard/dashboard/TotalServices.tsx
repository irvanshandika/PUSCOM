"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { db } from "@/src/config/FirebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ServiceRequest } from "@/src/types/service";
import { toast } from "react-hot-toast";

function TotalServices() {
  const [services, setServices] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesRef = collection(db, "service_requests");
      const q = query(servicesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceRequest[];
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Gagal memuat data service");
    }
  };
  return (
    <>
      <div className="p-6 rounded-xl shadow-md flex items-center text-green-500 bg-green-50 transition-transform hover:scale-105">
        <div className="mr-4 p-3 rounded-full bg-white/30">
          <TrendingUp className="w-6 h-6" />
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
