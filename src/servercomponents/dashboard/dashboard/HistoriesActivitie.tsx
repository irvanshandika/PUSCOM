/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { db } from "@/src/config/FirebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale"; // Menggunakan lokal Indonesia untuk waktu

function HistoriesActivities() {
  const [activities, setActivities] = useState<any[]>([]);

  // Fungsi untuk mengambil data aktivitas dari Firestore (service_requests)
  const fetchActivities = async () => {
    try {
      // Mengambil dari service_requests yang statusnya diubah
      const serviceRequestsRef = collection(db, "service_requests");
      const q = query(
        serviceRequestsRef,
        orderBy("updatedAt", "desc"), // Mengurutkan berdasarkan waktu terbaru
        limit(10) // Membatasi hanya 10 aktivitas terkini
      );
      const querySnapshot = await getDocs(q);
      
      const activitiesData = querySnapshot.docs
        .filter(doc => doc.data().status !== "pending") // Hanya ambil yang sudah diproses
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // Memuat data aktivitas saat komponen pertama kali dimuat
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fungsi untuk menampilkan pesan aktivitas berdasarkan status
  const getActivityMessage = (activity: any) => {
    const technicianName = activity.technicianName || "Teknisi";
    
    switch(activity.status) {
      case "in_progress":
        return `${technicianName} mengambil alih perbaikan`;
      case "completed":
        return `${technicianName} telah menyelesaikan perbaikan`;
      case "rejected":
        return `${technicianName} menolak perbaikan`;
      default:
        return "Status diperbarui";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Aktivitas Terkini</h2>
      {activities.length > 0 ? (
        activities.map((activity) => {
          // Menghitung waktu relatif menggunakan date-fns
          const timestamp = activity.updatedAt || activity.createdAt;
          const relativeTime = formatDistanceToNow(new Date(timestamp.seconds * 1000), {
            addSuffix: true,
            locale: id, // Menggunakan bahasa Indonesia untuk waktu relatif
          });

          return (
            <div key={activity.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium">{getActivityMessage(activity)}</p>
                <p className="text-sm text-gray-500">Pelanggan: {activity.name}</p>
              </div>
              <span className="text-sm text-gray-400">{relativeTime}</span>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">Belum ada aktivitas terkini</p>
      )}
    </div>
  );
}

export default HistoriesActivities;