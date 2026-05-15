"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { EmployerDashboard } from "@/components/dashboard/EmployerDashboard";
import { JobSeekerDashboard } from "@/components/dashboard/JobSeekerDashboard";
import { Loader2, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Try to get user from NextAuth session first
    if (session?.user) {
      setUser(session.user);
    } else {
      // Fallback to localStorage for old JWT auth
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card border border-border p-6 sm:p-12 rounded-2xl sm:rounded-[40px] shadow-2xl max-w-md w-full">
          <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Нэвтрэх шаардлагатай</h1>
          <p className="text-muted-foreground mb-8">Хянах самбарт нэвтрэхийн тулд эхлээд системд нэвтэрнэ үү.</p>
          <Link href="/login" className="bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all inline-block shadow-lg shadow-accent/20">
            Нэвтрэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Сайн байна уу, {user.name} 👋</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Хянах самбарт тавтай морил.</p>
        </div>

        {user.role === "EMPLOYER" ? (
          <EmployerDashboard />
        ) : (
          <JobSeekerDashboard />
        )}
      </div>
    </div>
  );
}

