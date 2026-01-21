"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Morate biti prijavljeni");
      router.replace("/login");
    }
  }, [router]);
  // ne renderujemo nista dok proveravamo auth
  return <>{children}</>;
};

export default DashboardLayout;
