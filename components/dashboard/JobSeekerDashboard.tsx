"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

export function JobSeekerDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Миний илгээсэн анкетууд</h2>
        <div className="bg-accent/10 text-accent px-4 py-2 rounded-xl text-sm font-bold border border-accent/20">
          Нийт {applications.length}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 sm:p-16 text-center shadow-xl">
          <div className="bg-muted w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold mb-2">Анкет илгээгээгүй байна</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Танд тохирох ажлын байруудтай танилцаж, анкет илгээж эхлээрэй.
          </p>
          <a href="/jobs" className="bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all inline-block shadow-lg shadow-accent/20">
            Ажил хайх
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-5 sm:p-6 md:p-8 hover:border-accent/30 transition-all group relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row gap-4 sm:gap-8 relative z-10">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center font-bold text-2xl border border-border group-hover:bg-accent/10 group-hover:border-accent/30 group-hover:text-accent transition-all shrink-0">
                  {app.job.employer.name[0]}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">{app.job.title}</h3>
                      <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {app.job.employer.name}
                      </p>
                    </div>
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border self-start",
                      app.status === 'ACCEPTED' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      app.status === 'REJECTED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {app.job.location}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-green-500">
                      <DollarSign className="w-4 h-4" />
                      ${app.job.salary.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <FileText className="w-4 h-4" />
                      {app.cvName || "CV Илгээсэн"}
                    </div>
                    <a 
                      href={app.cvUrl} 
                      target="_blank" 
                      className="text-accent hover:underline text-sm font-bold flex items-center gap-1"
                    >
                      CV Үзэх
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

