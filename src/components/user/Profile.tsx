import { LogOut, MoveUpRight, Settings, CreditCard, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/src/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}


interface UserData {
  displayName: string;
  photoURL: string;
  roles: string;
}

export default function Profile01() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/auth/signin");
    } catch (error) {
      toast.error("Error logging out");
      console.error("Error logging out:", error);
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: "Subscription",
      value: "Free Trial",
      href: "#",
      icon: <CreditCard className="w-4 h-4" />,
      external: false,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      external: true,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              <Image src={userData?.photoURL || "/default-avatar.png"} alt={userData?.displayName || "User"} width={72} height={72} className="rounded-full ring-4 ring-white dark:ring-zinc-900 object-cover" />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{userData?.displayName || "User"}</h2>
              <p className="text-zinc-600 dark:text-zinc-400">{userData?.roles || "User"}</p>
            </div>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                          hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                          rounded-lg transition-colors duration-200">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.value && <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">{item.value}</span>}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              type="button"
              className="w-full flex items-center justify-between p-2 
                        hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                        rounded-lg transition-colors duration-200">
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
