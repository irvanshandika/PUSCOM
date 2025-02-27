/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/src/config/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword } from "firebase/auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/src/components/ui/dialog";
import { Eye, EyeOff, Upload } from "lucide-react";
import bcrypt from "bcryptjs";
import Image from "next/image";

// Profile schema definition
const profileSchema = z.object({
  displayName: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^[0-9+\-\s()]*$/, { message: "Phone number contains invalid characters" }),
});

// Password schema definition
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signType, setSignType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/forbidden");
    } else if (user) {
      // Set basic user data from Authentication
      form.setValue("displayName", user.displayName || "");
      form.setValue("email", user.email || "");
      setPhotoURL(user.photoURL || "");
      setPhotoPreview(user.photoURL || "");

      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSignType(userData.signType);
          form.setValue("phoneNumber", userData.phoneNumber || "");
        }
      };
      fetchUserData();
    }
  }, [user, loading, router, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndPreviewFile(file);
    }
  };

  const validateAndPreviewFile = (file: File) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an image file (JPG, PNG, GIF, WEBP, SVG)");
      return;
    }

    // Check file size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be less than 15MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPreviewFile(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      let newPhotoURL = photoURL;

      // Handle photo upload
      if (photoPreview && photoPreview !== photoURL) {
        const fileInput = document.getElementById("profile-photo") as HTMLInputElement;
        let file: File | undefined;
        
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          file = fileInput.files[0];
        } else if (photoPreview.startsWith('data:')) {
          // Handle dropped file that was previewed but not in the file input
          // Convert base64 to file
          const response = await fetch(photoPreview);
          const blob = await response.blob();
          file = new File([blob], "profile.jpg", { type: 'image/jpeg' });
        }

        if (file) {
          const storageRef = ref(storage, `profileImages/${user.uid}`);
          await uploadBytes(storageRef, file);
          newPhotoURL = await getDownloadURL(storageRef);
        }
      }

      // Update user data in Firestore
      const updateData: any = {
        displayName: data.displayName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        photoURL: newPhotoURL,
      };

      // Update user document
      await updateDoc(doc(db, "users", user.uid), updateData);

      toast.success("Profile updated successfully!", {
        icon: "🚀",
        duration: 3000,
      });

      setIsDialogOpen(false);

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      toast.error("Error updating profile. Please try again.");
      console.error("Profile update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user || signType !== "credential") return;

    try {
      setIsPasswordUpdating(true);

      // Update Firebase Auth password
      await updatePassword(user, data.newPassword);
      
      // Update the hashed password in Firestore
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.newPassword, salt);
      
      await updateDoc(doc(db, "users", user.uid), {
        hashedPassword: hashedPassword
      });

      toast.success("Password updated successfully! You will be logged out.", {
        duration: 3000,
      });
      
      // Clear form
      passwordForm.reset();
      
      // Log out after password change
      setTimeout(() => {
        auth.signOut();
        router.push("/signin");
      }, 3000);
    } catch (err) {
      toast.error("Error updating password. Please try again.");
      console.error("Password update error:", err);
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse"></div>
        {/* Loading skeleton for tabs */}
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        {/* Loading skeleton for card */}
        <div className="h-96 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">This is how others will see you on the site.</p>
      </div>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="password" disabled={signType === "google"}>Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || "/placeholder-avatar.jpg"} alt="Avatar" />
                    <AvatarFallback>{form.getValues().displayName?.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mb-2">
                          Change Avatar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Avatar</DialogTitle>
                          <DialogDescription>
                            Upload a new profile picture. JPG, PNG, GIF, WEBP or SVG. Max size of 15MB.
                          </DialogDescription>
                        </DialogHeader>
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center ${
                            isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          {photoPreview && (
                            <div className="mb-4 flex justify-center">
                              <Image 
                                src={photoPreview} 
                                alt="Preview" 
                                width={150} 
                                height={150} 
                                className="rounded-lg max-h-40 object-cover" 
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 flex-col items-center">
                              <label
                                htmlFor="profile-photo"
                                className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="profile-photo"
                                  name="profile-photo"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              JPG, PNG, GIF, WEBP or SVG up to 15MB
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={() => setIsDialogOpen(false)}>
                            Done
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <p className="text-sm text-muted-foreground">JPG, PNG, GIF, WEBP or SVG. Max size of 15MB</p>
                  </div>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormDescription>This is your public display name.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="example@example.com" 
                            {...field} 
                            disabled={signType === "google"}
                            className={signType === "google" ? "cursor-not-allowed" : ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {signType === "google" 
                            ? "Email cannot be changed for Google accounts" 
                            : "You can manage verified email addresses in your email settings."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormDescription>Your contact phone number.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Update profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password here. After saving, you&apos;ll be logged out.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showCurrentPassword ? "text" : "password"}
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showCurrentPassword ? 
                                <EyeOff className="h-5 w-5 text-gray-400" /> : 
                                <Eye className="h-5 w-5 text-gray-400" />
                              }
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showNewPassword ? "text" : "password"}
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showNewPassword ? 
                                <EyeOff className="h-5 w-5 text-gray-400" /> : 
                                <Eye className="h-5 w-5 text-gray-400" />
                              }
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Password must contain at least one uppercase letter, one lowercase letter, and one number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"}
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showConfirmPassword ? 
                                <EyeOff className="h-5 w-5 text-gray-400" /> : 
                                <Eye className="h-5 w-5 text-gray-400" />
                              }
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPasswordUpdating}>
                    {isPasswordUpdating ? "Updating..." : "Save password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Switch id="marketing" />
                <div className="space-y-1">
                  <Label htmlFor="marketing">Marketing emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new products, features, and more.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Switch id="social" />
                <div className="space-y-1">
                  <Label htmlFor="social">Social notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when someone mentions you or replies to your messages.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Switch id="security" defaultChecked />
                <div className="space-y-1">
                  <Label htmlFor="security">Security emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about your account security and privacy.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save notification settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfilePage;