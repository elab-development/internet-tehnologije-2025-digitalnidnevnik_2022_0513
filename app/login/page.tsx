"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { loginSchema, LoginFormData } from "@/lib/validacije/login.schema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GuestGuard from "@/components/auth/guest-guard";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LoginPage = () => {
  const router = useRouter();

  // react-hook-form + zod validacija za login formu
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // submit handler salje kredencijale na backend i cuva token + rolu u localStorage
  const onSubmit = async (values: LoginFormData) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Neuspešna prijava");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.username);

      // refresh
      window.dispatchEvent(new Event("auth-changed"));

      toast.success("Uspešna prijava");
      setTimeout(() => {
        router.push("/dashboard");
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
            <h1 className="text-xl font-semibold text-center">Prijava</h1>

            {form.formState.errors.root && (
              <p className="text-sm text-red-600 text-center">
                {form.formState.errors.root.message}
              </p>
            )}

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
            <Card className="mt-3 border-0 bg-muted/40 shadow-none">
              <CardContent className="space-y-2 px-3 py-2 text-xs">
                <p className="text-muted-foreground">Demo nalozi:</p>

                <div className="flex items-center justify-between">
                  <Badge variant="destructive" className="h-5 px-2 text-[10px]">
                    Admin
                  </Badge>
                  <span className="font-mono text-muted-foreground">
                    admin:password123
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="h-5 bg-blue-500 px-2 text-[10px] hover:bg-blue-500">
                    Nastavnik
                  </Badge>
                  <span className="font-mono text-muted-foreground">
                    milica:password123
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="h-5 bg-green-500 px-2 text-[10px] hover:bg-green-500">
                    Student
                  </Badge>
                  <span className="font-mono text-muted-foreground">
                    marko:password123
                  </span>
                </div>
              </CardContent>
            </Card>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Prijava..." : "Prijavi se"}
            </Button>
          </form>
        </Form>
      </GuestGuard>
    </div>
  );
};

export default LoginPage;
