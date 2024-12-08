"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { db, auth } from "@/src/config/FirebaseConfig";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { User, RefreshCcw, Users, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface UserData {
  id: string;
  displayName: string;
  email: string;
  roles: "user" | "admin";
  photoURL?: string;
}

export default function UserManagementDashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      const usersList = usersSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as UserData)
      );

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { roles: newRole });

      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, roles: newRole } : user)));

      toast.success("Role berhasil diperbarui");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Gagal memperbarui role");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.roles === "admin");
        } else {
          setIsAdmin(false);
        }
        setCheckingRole(false);
      }
    };

    if (user) {
      checkUserRole();
    } else if (!loading) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Memeriksa hak akses...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isAdmin) {
    router.push("/forbidden");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            Manajemen Pengguna
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCcw className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>
                      {userData.photoURL ? (
                        <Image src={userData.photoURL} alt="Foto Profil" className="w-10 h-10 rounded-full object-cover" width={0} height={0} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{userData.displayName}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      <Badge variant={userData.roles === "admin" ? "default" : "secondary"}>{userData.roles}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select value={userData.roles} onValueChange={(value: "user" | "admin") => handleUpdateRole(userData.id, value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Pilih Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Statistik Pengguna */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pengguna</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <User className="w-8 h-8 text-primary/70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admin</p>
              <p className="text-2xl font-bold">{users.filter((user) => user.roles === "admin").length}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">User Biasa</p>
              <p className="text-2xl font-bold">{users.filter((user) => user.roles === "user").length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
