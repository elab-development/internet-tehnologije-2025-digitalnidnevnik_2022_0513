import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Korisničko ime je obavezno."),
  password: z.string().min(6, "Lozinka mora da ima najmanje 6 karaktera."),
});

export type LoginFormData = z.infer<typeof loginSchema>;
