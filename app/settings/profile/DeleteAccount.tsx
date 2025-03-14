"use client";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { db, auth } from "@/src/config/FirebaseConfig"; // Firebase imports
import { doc, deleteDoc } from "firebase/firestore"; // Firebase Firestore delete
import { deleteUser } from "firebase/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmText !== "delete") return;

    setIsDeleting(true);
    try {
      if (!auth.currentUser) {
        throw new Error("No user is currently authenticated.");
      }

      const user = auth.currentUser;

      // Delete user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef); // Deletes the user document from the 'users' collection

      // Delete the user from Firebase Authentication
      await deleteUser(user); // Deletes the user from Firebase Auth

      // Show a success message and close the dialog
      setIsDialogOpen(false);
      toast.success("Your account has been successfully deleted.");

      // Optionally, redirect user to login or home page
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("There was an error deleting your account. Please try again.");
    } finally {
      setIsDeleting(false);
      setConfirmText("");
    }
  };

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="text-xl text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>Once you delete your account, there is no going back. Please be certain.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">Deleting your account will:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-6">
            <li>Permanently remove all your personal information</li>
            <li>Delete all your service history and records</li>
            <li>Cancel any pending service requests</li>
            <li>Remove access to all PUSCOM services</li>
          </ul>
        </CardContent>
        <CardFooter className="border-t border-border/40 pt-6">
          <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
            Delete Account
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium">
                To confirm, type <span className="font-semibold">delete</span> in the field below
              </Label>
              <Input id="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="delete" className="w-full" />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setConfirmText("");
              }}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={confirmText !== "delete" || isDeleting} onClick={handleDeleteAccount}>
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}