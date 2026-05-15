"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Save, ArrowLeft, ShieldCheck, FileText, Building2, Pencil, Upload, Eye, EyeOff, Globe } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If NextAuth reports unauthenticated, check for local JWT fallback
    if (status === "unauthenticated") {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (localToken) {
        // there is a fallback token saved from legacy/login endpoint — use it
        fetchProfile();
        return;
      }
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  function getAuthToken() {
    // Try to get token from NextAuth session first, then fallback to localStorage
    if (session?.user?.email) {
      return "nextauth";
    }
    return localStorage.getItem("token");
  }

  async function fetchProfile() {
    try {
      const token = getAuthToken();
      if (!token) {
        setMessage({ type: "error", text: "არაამომწურო - კიდევ სცადეთ ხელმისაწვდომი" });
        setLoading(false);
        return;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      
      // For NextAuth session, we don't need to send Authorization header
      if (token !== "nextauth") {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/users/me", { headers, credentials: "include" });
      const data = await res.json();
      
      if (data.user) {
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setImage(data.user.image || "");
        setBio(data.user.bio || "");
        setWebsite(data.user.website || "");
        setUserRole(data.user.role || "");
      } else if (res.status === 401) {
        router.push("/login");
      } else {
        setMessage({ type: "error", text: data.error || "Профиль өнгөрүүлэхэд алдаа гарлаа" });
      }
    } catch (err) {
      console.error("[Profile fetch error]:", err);
      setMessage({ type: "error", text: "Профиль өнгөрүүлэхэд алдаа гарлаа" });
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token !== "nextauth") {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ 
          name, 
          email, 
          image,
          bio,
          website,
          ...(password ? { password } : {}) 
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Амжилттай хадгалагдлаа!" });
        setPassword("");
        setIsEditing(false);
        // Re-fetch to ensure latest data
        setTimeout(() => fetchProfile(), 500);
      } else {
        setMessage({ type: "error", text: data.error || data.details || "Хадгалахад алдаа гарлаа" });
      }
    } catch (err) {
      console.error("[Profile update error]:", err);
      setMessage({ type: "error", text: "Сүлжээний алдаа гарлаа" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const hasLegacyAuth = typeof window !== "undefined" && !!localStorage.getItem("token");

  if (status === "unauthenticated" && !hasLegacyAuth) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Нүүр хуудас руу буцах
      </Link>

      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-start gap-4 mb-8 sm:flex-row sm:items-center">
            <div className="bg-accent/10 p-3 rounded-2xl">
              {userRole === 'EMPLOYER' ? <Building2 className="w-6 h-6 text-accent" /> : <User className="w-6 h-6 text-accent" />}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold">{userRole === 'EMPLOYER' ? "Компанийн мэдээлэл" : "Хэрэглэгчийн бүртгэл"}</h1>
              <p className="text-sm text-muted-foreground">{userRole === 'EMPLOYER' ? "Компанийн мэдээллээ эндээс засна уу" : "Та өөрийн мэдээллээ удирдаарай"}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-accent/10 text-accent p-3 rounded-xl hover:bg-accent/20 transition-all flex items-center gap-2 font-bold text-sm"
              >
                <Pencil className="w-4 h-4" />
                Засах
              </button>
            )}
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-muted rounded-full overflow-hidden border-4 border-border group-hover:border-accent/30 transition-all flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/5 text-accent text-4xl font-bold">
                    {name?.[0] || "U"}
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) {
                        // uploadthing v7+: prefer ufsUrl, fallback to url for older responses
                        setImage(res[0].ufsUrl || res[0].url);
                        setMessage({ type: "success", text: "Зураг амжилттай сонгогдлоо. Хадгалах товчийг дарж баталгаажуулна уу." });
                      }
                    }}
                    onUploadError={(error: Error) => {
                      setMessage({ type: "error", text: `Зураг хуулахад алдаа гарлаа: ${error.message}` });
                    }}
                    appearance={{
                      button: "bg-accent text-accent-foreground text-xs h-10 px-4 rounded-xl font-bold",
                      allowedContent: "hidden"
                    }}
                    content={{
                      button({ ready }) {
                        if (ready) return <div className="flex items-center gap-2"><Upload className="w-4 h-4" /> {userRole === 'EMPLOYER' ? "Лого сонгох" : "Зураг сонгох"}</div>;
                        return "Уншиж байна...";
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border ${
              message.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-500" 
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                {userRole === 'EMPLOYER' ? "Компанийн нэр" : "Бүтэн нэр"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-background/50 pl-11 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all disabled:opacity-50"
                  placeholder={userRole === 'EMPLOYER' ? "Компанийн нэр" : "John Doe"}
                  required
                />
              </div>
            </div>

            {userRole === 'EMPLOYER' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                    Вэбсайт холбоос
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-background/50 pl-11 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all disabled:opacity-50"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                    Компанийн танилцуулга
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-background/50 pl-11 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all min-h-[120px] resize-none disabled:opacity-50"
                      placeholder="Компанийн тухай товч мэдээлэл..."
                    />
                  </div>
                </div>
              </>
            )}

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
                  disabled={!isEditing}
                  className="w-full bg-background/50 pl-11 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all disabled:opacity-50"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-border">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  Нууц үг солих
                </h2>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                    Шинэ нууц үг (өөрчлөхгүй бол хоосон орхино уу)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-background/50 pl-11 pr-12 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all disabled:opacity-50"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-muted text-muted-foreground py-4 rounded-xl font-bold hover:bg-muted/80 transition-all"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] bg-accent text-accent-foreground py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Өөрчлөлтийг хадгалах
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

