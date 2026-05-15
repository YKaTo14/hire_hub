"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, Filter, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Job {
  id: number;
  title: string;
  description: string;
  salary: number;
  location: string;
  type: string;
  category?: string;
  customCategory?: string;
  createdAt: string;
  employer: {
    name: string;
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [jobType, setJobType] = useState("All Types");
  const [category, setCategory] = useState("All Categories");
  const [minSalary, setMinSalary] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [jobType, minSalary]);

  useEffect(() => {
    fetchJobs();
  }, [category]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (locationQuery) params.append("location", locationQuery);
      if (jobType !== "All Types") params.append("type", jobType);
      if (category !== "All Categories") params.append("category", category);
      if (minSalary > 0) params.append("minSalary", minSalary.toString());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Танд тохирох ажлаа ол</h1>
        <form onSubmit={handleSearch} className="bg-card/50 border border-border p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto shadow-2xl backdrop-blur mb-8">
          <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-border py-2 md:py-0">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Ажлын нэр, ур чадвар эсвэл компани"
              className="bg-transparent border-none outline-none w-full text-sm py-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center px-4 gap-3 py-2 md:py-0">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Хот, дүүрэг эсвэл зайнаас"
              className="bg-transparent border-none outline-none w-full text-sm py-3"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-accent text-accent-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Хайх
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          {currentUser?.role === 'EMPLOYER' && (
            <Link 
              href="/post-job"
              className="w-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-accent-foreground py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/5 mb-8"
            >
              <Plus className="w-4 h-4" />
              Ажил зарлах
            </Link>
          )}

          <div className="rounded-2xl border border-border bg-card p-4 lg:border-0 lg:bg-transparent lg:p-0">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Шүүлтүүр
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Ажлын төрөл</label>
                <div className="relative">
                  <select 
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm appearance-none outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="All Types">Бүх төрөл</option>
                    <option value="FULL_TIME">Бүтэн цаг</option>
                    <option value="REMOTE">Зайнаас</option>
                    <option value="CONTRACT">Гэрээт</option>
                    <option value="INTERNSHIP">Дадлага</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Салбар</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm appearance-none outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="All Categories">Бүх салбар</option>
                    <option value="ENGINEERING">Инженеринг</option>
                    <option value="PRODUCT">Бүтээгдэхүүн</option>
                    <option value="DESIGN">Дизайн</option>
                    <option value="MARKETING">Маркетинг</option>
                    <option value="SALES">Борлуулалт</option>
                    <option value="FINANCE">Санхүү</option>
                    <option value="HR">Хүний нөөц</option>
                    <option value="OPERATIONS">Операци</option>
                    <option value="CUSTOMER_SUPPORT">Хэрэглэгчийн дэмжлэг</option>
                    <option value="OTHER">Бусад</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-muted-foreground">Доод цалин ($)</label>
                  <span className="text-xs font-bold text-accent">${minSalary}</span>
                </div>
                <input 
                  type="range" 
                  className="w-full accent-accent bg-muted h-1.5 rounded-lg appearance-none cursor-pointer"
                  min="0"
                  max="10000"
                  step="500"
                  value={minSalary}
                  onChange={(e) => setMinSalary(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Job List */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg sm:text-xl">{jobs.length} ажлын байр олдлоо</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-card animate-pulse rounded-2xl border border-border"></div>
              ))
            ) : jobs.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Ажлын байр олдсонгүй</h3>
                <p className="text-sm text-muted-foreground">Шүүлтүүрээ өөрчилж хайлт хийж үзнэ үү.</p>
              </div>
            ) : (
              jobs.map((job) => {
                const categoryLabel = job.customCategory || job.category;

                return (
                <div 
                  key={job.id}
                  className="p-4 sm:p-6 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 hover:shadow-2xl hover:-translate-y-0.5 transition-all transform group"
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl border border-border bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shrink-0">
                    {job.employer.name[0]}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h3 className="font-bold text-base sm:text-lg group-hover:text-accent transition-colors">{job.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.employer.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="font-bold text-green-400 bg-green-900/10 px-2 py-0.5 rounded-md">
                        ${job.salary}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        job.type === 'FULL_TIME' ? "bg-accent/10 text-accent border-accent/20" : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                      )}>
                        {job.type.replace('_', ' ')}
                      </span>
                      {categoryLabel && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border bg-muted/10 text-muted-foreground">
                          {categoryLabel.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link 
                    href={`/jobs/${job.id}`}
                    className="bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap self-stretch md:self-auto flex items-center justify-center"
                  >
                    Дэлгэрэнгүй
                  </Link>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

