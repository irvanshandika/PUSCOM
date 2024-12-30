import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(50, "Nama maksimal 50 karakter")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi")
      .transform((val) => val.trim()),
    email: z.string().email("Email tidak valid"),

    phoneNumber: z
      .string()
      .min(10, "Nomor telepon minimal 10 karakter")
      .max(15, "Nomor telepon maksimal 15 karakter")
      .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),

    photoURL: z.string().url("URL tidak valid"),

    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;