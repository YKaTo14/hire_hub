"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, Briefcase, TrendingUp, Database, PenTool, BarChart2, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Инженерчлэл", jobs: 3, icon: Briefcase },
  { name: "Бизнес", jobs: 1, icon: TrendingUp },
  { name: "Дата", jobs: 1, icon: Database },
  { name: "Дизайн", jobs: 1, icon: PenTool },
  { name: "Маркетинг", jobs: 1, icon: BarChart2 },
  { name: "Бүтээгдэхүүн", jobs: 1, icon: Rocket },
];

const featuredJobs = [
  {
    id: 1,
    title: "Senior Full-Stack Developer",
    company: "TechCorp Mongolia",
    logo: "TE",
    type: "full-time",
    location: "Ulaanbaatar, Mongolia",
    salary: "$3000k - 6000k",
    description: "We are looking for a senior full-stack developer with expertise in React and Node.js to join our growing..."
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "TechCorp Mongolia",
    logo: "TE",
    type: "full-time",
    location: "Ulaanbaatar, Mongolia",
    salary: "$2000k - 4000k",
    description: "Creative UI/UX designer to design beautiful and intuitive interfaces for our enterprise software..."
  },
  {
    id: 3,
    title: "DevOps Engineer",
    company: "TechCorp Mongolia",
    logo: "TE",
    type: "remote",
    location: "Remote",
    salary: "$4000k - 7000k",
    description: "Looking for an experienced DevOps engineer to manage our cloud infrastructure and CI/CD..."
  },
  {
    id: 4,
    title: "Business Analyst",
    company: "Innovate Solutions",
    logo: "IN",
    type: "full-time",
    location: "Ulaanbaatar, Mongolia",
    salary: "$2500k - 4500k",
    description: "Analyze business requirements, work with stakeholders and create detailed specifications for..."
  },
  {
    id: 5,
    title: "Marketing Manager",
    company: "Innovate Solutions",
    logo: "IN",
    type: "full-time",
    location: "Ulaanbaatar, Mongolia",
    salary: "$2000k - 3500k",
    description: "Lead our digital marketing strategy across all channels. Manage campaigns, analyze data and..."
  },
  {
    id: 6,
    title: "Junior React Developer",
    company: "TechCorp Mongolia",
    logo: "TE",
    type: "full-time",
    location: "Ulaanbaatar, Mongolia",
    salary: "$1200k - 2000k",
    description: "Excellent opportunity for a junior developer to join our team and grow with mentorship from senior..."
  }
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user && (session.user as any).role) {
      setUserRole((session.user as any).role);
      return;
    }

    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.role) setUserRole(parsed.role);
      } catch (e) {
        // ignore
      }
    }
  }, [session]);

  return (
    <div className="space-y-16 pb-16 sm:space-y-20 sm:pb-20 lg:space-y-24 lg:pb-24">
      {/* Top Nav */}
      <header className="hidden">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5 backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-bold text-white">HireHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/jobs" className="hover:text-white">Ажлын байр</Link>
            <Link href="/post-job" className="hover:text-white">Ажил зарлах</Link>
            <Link href="/login" className="hover:text-white">Нэвтрэх</Link>
          </nav>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative py-14 text-center sm:py-20 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0f172a] via-[#071033] to-[#021024] opacity-95"></div>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium mb-8 border border-accent/20">
            <Sparkles className="w-3 h-3" />
            Карьераа ахиул
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-[1.12] text-accent/80">
            Хиймэл оюун ухаанаар ажилладаг элсүүлэх платформ нь таны мөрөөдлийн дүрд хүрэхэд тань тусална
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
            Шилдэг авьяастнууд болон шинэлэг компаниудын сүлжээнд нэгдэж, дараагийн карьераа олж ав.
          </p>

          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex flex-col gap-2 bg-white/3 p-2 rounded-2xl shadow-lg backdrop-blur-md border border-white/6 md:flex-row md:items-center md:rounded-full">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2 md:py-0">
                <Search className="w-5 h-5 text-white/80" />
                <input 
                  type="text"
                  placeholder="Ажлын нэр, түлхүүр үг эсвэл компани"
                  className="bg-transparent border-none outline-none w-full text-sm text-white/90 placeholder-white/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex min-w-0 items-center gap-3 border-t border-white/6 px-4 py-2 md:w-72 md:border-l md:border-t-0 md:px-3 md:py-0">
                <MapPin className="w-5 h-5 text-white/70" />
                <input 
                  type="text"
                  placeholder="Хот, дүүрэг эсвэл зайнаас"
                  className="w-full bg-transparent border-none outline-none text-sm text-white/90 placeholder-white/60"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
              <button className="w-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform shadow-2xl md:w-auto md:rounded-full">
                Ажил хайх
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-muted-foreground">Түгээмэл:</span>
            {["Програм хангамжийн инженер", "Бүтээгдэхүүний менежер", "Дизайнер"].map((tag) => (
              <button 
                key={tag}
                className="bg-accent/10 hover:bg-accent/20 text-accent px-3 py-1 rounded-full border border-accent/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ангилалаар хайх</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Өөрийн мэргэжлийн чиглэлээр хамгийн тохиромжтой ажлыг олоорой. Бидэнд бүх томоохон салбарт боломжууд бий.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.name}
              className="group p-6 bg-white/3 border border-white/6 rounded-2xl hover:shadow-2xl hover:scale-105 transform transition-all cursor-pointer text-center"
            >
              <div className="bg-gradient-to-br from-violet-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-white">{cat.name}</h3>
              <p className="text-sm text-white/75">{cat.jobs} ажлын байр</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hiring CTA Section */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0ea5a4] to-[#06b6d4] p-6 sm:p-8 md:rounded-3xl md:p-16">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">Шилдэг авьяастнуудыг хайж байна уу?</h2>
            <p className="text-white text-base sm:text-lg md:text-xl mb-8 sm:mb-12 leading-relaxed opacity-95">
              HireHub дээр мөрөөдлийн багаа бүрдүүлж буй зуу зуун шинэлэг компаниудтай нэгдээрэй. Өнөөдөр ажлын байр зарлаж, мэргэшсэн нэр дэвшигчидтэй холбогдоорой.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {userRole === 'EMPLOYER' ? (
                <>
                  <Link href="/post-job" className="bg-white text-[#065f46] px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all text-lg shadow-md text-center">
                    Одоо ажлын байр зарлах
                  </Link>
                  <Link href="/jobs" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all text-lg text-center">
                    Би ажил хайж байна
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="bg-white text-[#065f46] px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all text-lg shadow-md text-center">
                    Би ажил хайж байна
                  </Link>
                  <Link href="/signup-choice" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all text-lg text-center">
                    Одоо ажлын байр зарлах
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Simulated background image overlay */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="grid grid-cols-8 grid-rows-8 gap-4 w-full h-full p-8 rotate-12 scale-150">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

