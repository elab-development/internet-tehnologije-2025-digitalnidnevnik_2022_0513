"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface GuestGuardLayoutProps {
  children: React.ReactNode;
}
// jednostavan guard
const GuestGuard = ({ children }: GuestGuardLayoutProps) => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return <>{children}</>;
};

export default GuestGuard;
