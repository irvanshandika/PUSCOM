/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { db } from "@/src/config/FirebaseConfig"; // Pastikan ini adalah konfigurasi Firestore Anda
import { collection, getDocs } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // Import untuk menghitung waktu relatif
import { id } from "date-fns/locale"; // Menggunakan lokal Indonesia untuk waktu

function HistoriesActivities() {
  const [activities, setActivities] = useState<any[]>([]);

  // Fungsi untuk mengambil data aktivitas dari Firestore
  const fetchActivities = async () => {
    try {
      const activitiesRef = collection(db, "recent_activities");
      const querySnapshot = await getDocs(activitiesRef);
      const activitiesData = querySnapshot.docs.map((doc) => ({
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Aktivitas Terkini</h2>
      {activities.map((activity) => {
        // Menghitung waktu relatif menggunakan date-fns
        const relativeTime = formatDistanceToNow(new Date(activity.timestamp.seconds * 1000), {
          addSuffix: true,
          locale: id, // Menggunakan bahasa Indonesia untuk waktu relatif
        });

        return (
          <div key={activity.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
            <div>
              <p className="font-medium">{activity.activity}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
            </div>
            <span className="text-sm text-gray-400">{relativeTime}</span>
          </div>
        );
      })}
    </div>
  );
}

export default HistoriesActivities;