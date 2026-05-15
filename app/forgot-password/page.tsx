"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Briefcase, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Имэйл илгээхэд алдаа гарлаа");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err) {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-md">
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-2xl"></div>
          
          <div className="text-center mb-6 sm:mb-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl sm:text-2xl mb-4 sm:mb-6 hover:opacity-80 transition-opacity">
              <div className="bg-accent p-1 sm:p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
              </div>
              <span>HireHub</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Нууц үг сэргээх</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Та бүртгэлтэй имэйл хаягаа оруулна уу
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm flex items-center gap-2">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="space-y-4 sm:space-y-6 relative z-10">
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Амжилттай илгээгдлээ!</p>
                  <p className="text-xs">Нууц үг сэргээх холбоос {email} хаягт илгээгдсон байна. Имэйл аа шалгана уу.</p>
                </div>
              </div>
              
              <Link 
                href="/login" 
                className="block w-full bg-accent text-accent-foreground py-3 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:opacity-90 transition-all text-center text-sm sm:text-base"
              >
                Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-2 ml-1">
                  Имэйл хаяг
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background/50 pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 border border-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 text-sm sm:text-base"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground py-3 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/20 text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                    Илгээж байна...
                  </span>
                ) : (
                  "Илгээх"
                )}
              </button>

              <div className="text-center pt-2">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-accent text-xs sm:text-sm font-bold hover:underline transition-all"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Нэвтрэх хуудас руу буцах
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
