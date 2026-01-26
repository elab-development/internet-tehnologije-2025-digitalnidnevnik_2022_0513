"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Link from "next/link";

import GuestGuard from "@/components/auth/guest-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  registerSchema,
  RegisterFormData,
} from "@/lib/validacije/register.schema";

const RegisterPage = () => {
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          role: "STUDENT", // svi novoregistrovani korisnici su ucenici
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registracija nije uspela");
        return;
      }

      toast.success("Uspešna registracija. Sada se možete prijaviti.");
      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch {
      toast.error("Greška na serveru");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <GuestGuard>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white p-6 rounded shadow w-80 space-y-4">
            <h1 className="text-xl font-semibold text-center">Registracija</h1>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Korisničko ime</FormLabel>
                  <FormControl>
                    <Input placeholder="milica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lozinka</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potvrda lozinke</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Registracija..." : "Registruj se"}
            </Button>

            <p className="text-center text-xs text-slate-600">
              Već imate nalog?{" "}
              <Link href="/login" className="font-bold">
                Prijavite se ovde
              </Link>
            </p>
          </form>
        </Form>
      </GuestGuard>
    </div>
  );
};

export default RegisterPage;
