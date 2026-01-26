import { z } from "zod";

// schema za register
export const registerSchema = z
  .object({
    username: z.string().min(1, "Korisničko ime je obavezno."),
    password: z.string().min(6, "Lozinka mora da ima najmanje 6 karaktera."),
    confirmPassword: z.string().min(6, "Potvrda lozinke je obavezna."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // dodatne provere
    message: "Lozinke se ne poklapaju.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
