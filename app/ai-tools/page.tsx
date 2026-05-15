"use client";

import { useState, useEffect } from "react";
import { Sparkles, Search, MapPin, Rocket, BrainCircuit, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MatchResult {
  job: {
    id: number;
    title: string;
    location: string;
    salary: number;
    employer: {
      name: string;
    };
  };
  score: number;
  explanation: string;
}

export default function AIToolsPage() {
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("3");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");

  const findMatches = async () => {
    if (!skills.trim()) {
      setError("Ур чадвараа оруулж хайлт хийнэ үү.");
      return;
    }
    
    setLoading(true);
    setError("");
    setMatches([]);
    
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, experience: parseInt(experience), location }),
      });
      
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Алдаа гарлаа. Дараа дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium mb-6 border border-accent/20">
          <BrainCircuit className="w-3 h-3" />
          HireHub AI Matchmaker
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">AI ашиглан төгс ажлаа ол</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Өөрийн ур чадвар, туршлага болон хайж буй ажлаа тодорхойл. Манай AI идэвхтэй ажлын байрууд дундаас танд хамгийн сайн тохирохыг олох болно.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card */}
        <div className="lg:col-span-4 bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-accent/10 p-2 rounded-xl">
                <Rocket className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold">Таны Профайл</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-muted-foreground">Ур чадвар</label>
                <textarea 
                  className="w-full bg-background/50 border border-border rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-accent/50 min-h-[120px] resize-none transition-all"
                  placeholder="ж.нь: React, Python, Төслийн менежмент..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-muted-foreground">Ажилласан жил</label>
                <input 
                  type="number"
                  className="w-full bg-background/50 border border-border rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-muted-foreground">Байршил</label>
                <input 
                  type="text"
                  className="w-full bg-background/50 border border-border rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder="ж.нь: Улаанбаатар, Зайнаас"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs font-medium bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button 
                onClick={findMatches}
                disabled={loading}
                className="w-full bg-accent text-accent-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Шинжилж байна..." : "Тохирох ажил хайх"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8 min-h-[600px] flex flex-col">
          {loading ? (
            <div className="flex-1 border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
              <div className="relative z-10">
                <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">Ажлын зах зээлийг шинжилж байна...</h3>
                <p className="text-muted-foreground max-sm mx-auto">
                  Манай AI таны профайлыг идэвхтэй ажлын байруудтай харьцуулж байна.
                </p>
              </div>
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3 px-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Нийт {matches.length} тохирох ажил олдлоо
              </h2>
              <div className="grid gap-6">
                {matches.map((match, i) => (
                  <div key={i} className="bg-card border border-border rounded-3xl p-6 hover:border-accent/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">
                        {Math.round(match.score * 100)}% Тохироо
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">{match.job.title}</h3>
                        <p className="text-muted-foreground text-sm font-medium mb-4">{match.job.employer.name}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-6">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {match.job.location}
                          </div>
                          <div className="font-bold text-green-500">
                            ${match.job.salary.toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-2xl p-4 text-sm leading-relaxed">
                          <span className="font-bold text-accent block mb-1">AI Тайлбар:</span>
                          {match.explanation}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Link 
                          href={`/jobs/${match.job.id}`}
                          className="bg-accent text-accent-foreground px-6 py-3 rounded-2xl font-bold text-sm w-full md:w-auto text-center hover:scale-105 transition-transform"
                        >
                          Одоо үзэх
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="bg-background border border-border w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Хайлт хийхэд бэлэн</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Зүүн талын хэсэгт мэдээллээ бөглөөд "Тохирох ажил хайх" товчийг дарж AI-ийн тусламжтай тохирох ажлаа олоорой.
                </p>
              </div>
              
              {/* Decorative background grid */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-full" style={{ 
                  backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
