"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Check,
  X,
  Loader2,
  BrainCircuit,
  Plus,
  Settings,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function EmployerDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ [key: number]: string }>({});

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

  const analyzeJob = async (jobId: number) => {
    setAiLoading(jobId);
    try {
      const res = await fetch("/api/ai/match-applicants", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(prev => ({ ...prev, [jobId]: data.analysis }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/applications/status", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ applicationId: id, status }),
      });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-accent/10 p-3 rounded-2xl text-accent"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Нийт анкет</p>
              <h3 className="text-2xl font-bold">{applications.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-2xl text-green-500"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Зөвшөөрсөн</p>
              <h3 className="text-2xl font-bold">{applications.filter(a => a.status === 'ACCEPTED').length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500"><Settings className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Компани</p>
                <h3 className="text-lg font-bold truncate max-w-[120px]">Мэдээлэл засах</h3>
              </div>
            </div>
            <Link 
              href="/profile" 
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              title="Компанийн мэдээлэл засах"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl sm:rounded-[32px] overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold text-lg">Ирсэн анкетууд</h2>
          <Link 
            href="/post-job"
            className="bg-accent text-accent-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Шинэ ажил зарлах
          </Link>
        </div>

        {Object.keys(aiAnalysis).length > 0 && (
          <div className="p-6 bg-accent/5 border-b border-border">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-accent" />
              AI Шинжилгээний үр дүн
            </h3>
            {Object.entries(aiAnalysis).map(([jobId, analysis]) => (
              <div key={jobId} className="bg-background border border-border rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {analysis}
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 sm:px-6 py-4">Нэр дэвшигч</th>
                <th className="px-4 sm:px-6 py-4">Ажлын байр</th>
                <th className="px-4 sm:px-6 py-4">CV</th>
                <th className="px-4 sm:px-6 py-4">Төлөв</th>
                <th className="px-4 sm:px-6 py-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-accent/5 transition-colors group">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center font-bold text-accent">
                        {app.user.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{app.user.name}</p>
                        <p className="text-xs text-muted-foreground">{app.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <p className="text-sm font-medium">{app.job.title}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {app.cvUrl ? (
                      <a 
                        href={app.cvUrl} 
                        target="_blank" 
                        className="inline-flex items-center gap-2 text-accent text-xs font-bold hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        CV Үзэх
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">CV байхгүй</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      app.status === 'ACCEPTED' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      app.status === 'REJECTED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                      <button 
                        onClick={() => analyzeJob(app.jobId)}
                        disabled={aiLoading === app.jobId}
                        className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all"
                        title="AI-аар шинжлэх"
                      >
                        {aiLoading === app.jobId ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                      </button>
                      <Link
                        href={`/messages?userId=${app.user.id}`}
                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        title="Мессеж бичих"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => updateStatus(app.id, 'ACCEPTED')}
                        className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                        title="Зөвшөөрөх"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, 'REJECTED')}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        title="Татгалзах"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

