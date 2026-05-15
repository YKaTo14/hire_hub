"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { Briefcase, UserPlus, Mail, Lock, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[k:string]:string}>({});

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "EMPLOYER" || roleParam === "USER") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setFieldErrors({});

    // Basic client-side validation
    const errors: {[k:string]:string} = {}
    if (!firstName.trim() || firstName.trim().length < 2) errors.firstName = 'Овог хоосон байна буюу 2-с доош байна';
    if (!lastName.trim() || lastName.trim().length < 2) errors.lastName = 'Нэр хоосон байна буюу 2-с доош байна';
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (phone && !phoneRegex.test(phone)) errors.phone = 'Утасны дугаар буруу форматтай';
    if (!degree) errors.degree = 'Боловсролын төвшин сонгоогүй байна';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName.trim()} ${lastName.trim()}`,
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          university: university.trim(),
          degree
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Бүртгэл хийхэд алдаа гарлаа");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("storage"));
        router.push("/");
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="text-center mb-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-6">
              <div className="bg-accent p-1.5 rounded-lg">
                <Briefcase className="w-6 h-6 text-accent-foreground" />
              </div>
              <span>HireHub</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">Бүртгэл үүсгэх</h1>
            <p className="text-muted-foreground text-sm">
              {role === "USER" ? "Ажил хайгчаар бүртгүүлэх" : "Ажил олгогчоор бүртгүүлэх"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                  Овог
              </label>
              <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-background/50 pl-4 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                    placeholder="Овог"
                    required
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
                  )}
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                  Нэр
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-background/50 pl-4 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                    placeholder="Нэр"
                    required
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
              </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                Имэйл хаяг
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background/50 pl-11 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                  placeholder="example@mail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">Утасны дугаар</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background/50 pl-4 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                  placeholder="+976 99xxxxxx"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">Их сургууль</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full bg-background/50 pl-4 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                  placeholder="Их сургууль"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">Боловсролын төвшин</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-background/50 pl-4 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="">Сонгоно уу</option>
                  <option value="HIGH_SCHOOL">Дунд сургууль</option>
                  <option value="BACHELOR">Бакалавр</option>
                  <option value="MASTER">Магистр</option>
                  <option value="PHD">Доктор</option>
                </select>
                {fieldErrors.degree && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.degree}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                Нууц үг
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/50 pl-11 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                  placeholder="•••••••• (хамгийн багадаа 6 тэмдэгт)"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                  Бүртгэж байна...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Бүртгүүлэх
                </span>
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Эсвэл</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full bg-background border border-border py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-muted transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google-ээр бүртгүүлэх
            </button>
          </form>

          <div className="mt-8 text-center text-sm relative z-10">
            <span className="text-muted-foreground">Аль хэдийн бүртгэлтэй юу? </span>
            <Link href="/login" className="text-accent font-bold hover:underline">
              Нэвтрэх
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-4" />}>
      <RegisterContent />
    </Suspense>
  );
}
