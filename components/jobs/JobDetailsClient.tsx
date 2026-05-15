"use client";

import { useState, useEffect } from "react";
import { MapPin, Briefcase, Calendar, DollarSign, ArrowLeft, Building2, Globe, Clock, CheckCircle2, UserCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ApplyModal } from "./ApplyModal";

interface JobDetailsClientProps {
  job: any;
}

export function JobDetailsClient({ job }: JobDetailsClientProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          href="/jobs" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Бүх ажил харах руу буцах
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Header Card */}
            <div className="bg-card border border-border rounded-[40px] p-8 md:p-12 shadow-2xl shadow-accent/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className="px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest border border-accent/20">
                    {job.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(job.createdAt).toLocaleDateString()}-нд нийтлэгдсэн
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">{job.title}</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl border border-border/50">
                    <div className="bg-background p-3 rounded-xl shadow-sm text-accent">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5">Сарын цалин</p>
                      <p className="font-bold text-lg">${job.salary.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl border border-border/50">
                    <div className="bg-background p-3 rounded-xl shadow-sm text-accent">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5">Байршил</p>
                      <p className="font-bold text-lg">{job.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-card border border-border rounded-[40px] p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-accent" />
                Ажлын байрны тодорхойлолт
              </h2>
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Action Card */}
            <div className="bg-card border border-border rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 space-y-6">
                {currentUser?.role === 'USER' ? (
                  <button 
                    onClick={() => setShowApplyModal(true)}
                    className="w-full bg-accent text-accent-foreground py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-accent/20"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Одоо анкет илгээх
                  </button>
                ) : currentUser?.role === 'EMPLOYER' ? (
                  <div className="bg-muted p-6 rounded-2xl border border-border text-center">
                    <p className="text-sm font-medium text-muted-foreground">Та ажил олгогчоор нэвтэрсэн байна.</p>
                  </div>
                ) : (
                  <Link 
                    href="/login"
                    className="w-full bg-accent text-accent-foreground py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-accent/20"
                  >
                    Нэвтэрч анкет илгээх
                  </Link>
                )}
                
                <p className="text-[11px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                  Илгээхээс өмнө CV-гээ PDF форматаар бэлдэнэ үү.
                </p>
              </div>
            </div>

            {/* Employer Card */}
            <div className="bg-card border border-border rounded-[32px] p-8 shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Ажил олгогч компани</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center font-bold text-2xl border border-border shrink-0">
                  {job.employer.image ? (
                    <img src={job.employer.image} alt={job.employer.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    job.employer.name[0]
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">{job.employer.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    Технологийн компани
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-2xl mb-8 border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 italic">
                  "{job.employer.bio || 'Энэ компани одоогоор өөрийн танилцуулгыг оруулаагүй байна.'}"
                </p>
              </div>

              <Link 
                href={`/companies?search=${encodeURIComponent(job.employer.name)}`}
                className="w-full bg-background border border-border py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-all"
              >
                Компанийн тухай үзэх
                <Globe className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal 
          jobId={job.id} 
          jobTitle={job.title} 
          onClose={() => setShowApplyModal(false)} 
        />
      )}
    </div>
  );
}
