"use client";

import { User, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupChoicePage() {
  const router = useRouter();

  const handleChoice = (role: string) => {
    router.push(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">HireHub-д тавтай морил</h1>
          <p className="text-muted-foreground text-lg">Та ямар зорилгоор бүртгүүлж байгаа вэ?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Job Seeker Choice */}
          <button 
            onClick={() => handleChoice('USER')}
            className="group relative bg-card border-2 border-border hover:border-accent p-8 rounded-[32px] transition-all hover:shadow-2xl hover:shadow-accent/5 text-left"
          >
            <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ажил хайж байна</h2>
            <p className="text-muted-foreground mb-8">Мөрөөдлийн ажлаа олж, AI-аар тохирох саналуудыг хүлээн аваарай.</p>
            <div className="flex items-center gap-2 text-accent font-bold">
              Үргэлжлүүлэх <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Employer Choice */}
          <button 
            onClick={() => handleChoice('EMPLOYER')}
            className="group relative bg-card border-2 border-border hover:border-accent p-8 rounded-[32px] transition-all hover:shadow-2xl hover:shadow-accent/5 text-left"
          >
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ажилтан хайж байна</h2>
            <p className="text-muted-foreground mb-8">Шилдэг авьяастнуудыг олж, багтаа урьж ажиллуулаарай.</p>
            <div className="flex items-center gap-2 text-primary font-bold">
              Үргэлжлүүлэх <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Аль хэдийн бүртгэлтэй юу?{" "}
            <Link href="/login" className="text-accent font-bold hover:underline">
              Нэвтрэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
