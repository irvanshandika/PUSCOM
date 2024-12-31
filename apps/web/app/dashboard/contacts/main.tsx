"use client";
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, deleteDoc, doc, getDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db, auth } from "@/src/config/FirebaseConfig";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@repo/ui/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

interface Contact {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
}

export default function ContactsDashboard() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const router = useRouter();

  const [contacts, loading, error] = useCollection(query(collection(db, "contacts"), orderBy("createdAt", "desc")), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const handleDelete = async () => {
    if (!deleteContact) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "contacts", deleteContact.id));
      setDeleteContact(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="flex justify-center items-center h-screen gap-2">
        <p className="text-xl font-semibold">Memeriksa hak akses</p>
        <Loader2 className="h-5 w-5 animate-spin" />
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
      <h1 className="mb-8 text-3xl font-bold">Manajemen Pesan</h1>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>No. Telepon</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts?.docs.map((doc) => {
              const contact = { id: doc.id, ...doc.data() } as Contact;
              return (
                <TableRow key={contact.id}>
                  <TableCell>
                    {format(new Date(contact.createdAt), "dd MMMM yyyy HH:mm", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" className="mr-2" onClick={() => setSelectedContact(contact)}>
                      Lihat Pesan
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteContact(contact)}>
                      Hapus Pesan
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {contacts?.empty && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Tidak ada pesan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Lihat Pesan */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pesan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama</p>
              <p>{selectedContact?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{selectedContact?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nomor Telepon</p>
              <p>{selectedContact?.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pesan</p>
              <p className="whitespace-pre-wrap">{selectedContact?.message}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tanggal Masuk</p>
              <p>
                {selectedContact?.createdAt &&
                  format(new Date(selectedContact.createdAt), "dd MMMM yyyy HH:mm", {
                    locale: id,
                  })}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Hapus Pesan */}
      <AlertDialog open={!!deleteContact} onOpenChange={() => setDeleteContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Pesan</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus pesan dari {deleteContact?.name}? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
