"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, Briefcase, CheckCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Сэргээх холбоос нүүлгэлэлтэй байна");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      return;
    }

    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Нууц үг сэргээхэд алдаа гарлаа");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-md">
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-center">
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-6 text-sm flex items-center gap-2 justify-center">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500"></span>
              Буруу холбоос
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Холбоос нүүлгэлэлтэй</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Дахин нууц үг сэргээх хүсэлт илгээнэ үү.
            </p>
            <Link 
              href="/forgot-password"
              className="inline-block bg-accent text-accent-foreground px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-bold hover:opacity-90 transition-all text-sm sm:text-base"
            >
              Дахин оролдох
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-md">
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-2xl"></div>
          
          <div className="text-center mb-6 sm:mb-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl sm:text-2xl mb-4 sm:mb-6 hover:opacity-80 transition-opacity">
              <div className="bg-accent p-1 sm:p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
              </div>
              <span>HireHub</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Шинэ нууц үг</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Та бүртгэлд ашилах шинэ нууц үг оруулна уу
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm flex items-center gap-2">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></span>
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4 sm:space-y-6 relative z-10">
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Амжилттай!</p>
                  <p className="text-xs">Та шинэ нууц үгээр нэвтрэх болно. Хаахын эргүүлэх хуудас......</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-2 ml-1">
                  Шинэ нууц үг
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background/50 pl-10 sm:pl-11 pr-10 sm:pr-11 py-2 sm:py-3 border border-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-2 ml-1">
                  Нууц үг баталгаажуулах
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background/50 pl-10 sm:pl-11 pr-10 sm:pr-11 py-2 sm:py-3 border border-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground py-3 rounded-lg sm:rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/20 text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                    Сэргээж байна...
                  </span>
                ) : (
                  "Нууц үг сэргээх"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-4" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
