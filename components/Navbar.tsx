"use client";

import Link from "next/link";
import {
  Briefcase,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserName((session.user as any).name || "Хэрэглэгч");
        setUserRole((session.user as any).role || "");
        return;
      }

      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        setIsLoggedIn(true);
        try {
          const parsedUser = JSON.parse(user);
          setUserName(parsedUser.name || "Хэрэглэгч");
          setUserRole(parsedUser.role || "");
        } catch (e) {
          console.error("Error parsing user", e);
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [session]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    if (session?.user) {
      await signOut({ redirect: true, callbackUrl: "/" });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      router.push("/");
      router.refresh();
    }
  };

  const roleLinks =
    userRole === "EMPLOYER"
      ? [
          { href: "/post-job", label: "Ажил зарлах", accent: true },
          { href: "/dashboard", label: "Миний ажлууд" },
        ]
      : [
          { href: "/jobs", label: "Ажил хайх" },
          { href: "/companies", label: "Компаниуд" },
        ];

  const navLinks = [
    ...roleLinks,
    { href: "/ai-tools", label: "AI хэрэгсэл" },
    { href: "/messages", label: "Мессеж" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="shrink-0 rounded-lg bg-accent p-1.5">
              <Briefcase className="h-5 w-5 text-accent-foreground" />
            </div>
            <span>HireHub</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground ${
                  link.accent ? "font-bold text-accent" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
              >
                <LogIn className="h-4 w-4" />
                Нэвтрэх
              </Link>
              <Link
                href="/signup-choice"
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" />
                Бүртгүүлэх
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Хянах самбар
              </Link>
              <Link
                href="/profile"
                className="flex max-w-[180px] items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-accent/50 hover:text-foreground"
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">{userName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Гарах
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto space-y-3 px-4 py-4">
            <div className="grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted ${
                    link.accent ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium"
                  >
                    <LogIn className="h-4 w-4" />
                    Нэвтрэх
                  </Link>
                  <Link
                    href="/signup-choice"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
                  >
                    <UserPlus className="h-4 w-4" />
                    Бүртгүүлэх
                  </Link>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Хянах самбар
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex min-w-0 items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">{userName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-muted hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Гарах
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
