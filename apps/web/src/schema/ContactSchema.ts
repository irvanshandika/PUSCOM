import * as z from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit"),
  message: z.string().min(1, "Pesan harus diisi")
})

export type ContactFormValues = z.infer<typeof contactSchema>