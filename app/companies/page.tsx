"use client";

import { useState, useEffect } from "react";
import { Search, Globe, MapPin, Building2, ExternalLink, Briefcase } from "lucide-react";
import Link from "next/link";

interface Company {
  id: number;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  _count?: {
    jobs: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (data.companies) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Шилдэг компаниуд</h1>
        <div className="bg-card border border-border p-2 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur max-w-2xl mx-auto">
          <div className="flex-1 flex items-center px-4 gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Компанийн нэрээр хайх..."
              className="bg-transparent border-none outline-none w-full text-sm py-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
        <div className="col-span-full mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold">{filteredCompanies.length} компани олдлоо</h2>
        </div>
        
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-card animate-pulse rounded-2xl border border-border"></div>
          ))
        ) : filteredCompanies.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-card border border-border rounded-3xl">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Компани олдсонгүй</h3>
            <p className="text-muted-foreground">Өөр түлхүүр үгээр хайж үзнэ үү.</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div 
              key={company.id}
              className="bg-card border border-border rounded-2xl p-5 sm:p-8 hover:border-accent/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-colors"></div>
              
              <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 relative z-10">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center font-bold text-2xl border border-border group-hover:bg-accent/10 group-hover:border-accent/30 group-hover:text-accent transition-all shrink-0">
                  {company.image ? (
                    <img src={company.image} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    company.name?.[0] || "C"
                  )}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-accent transition-colors">{company.name || "Нэргүй компани"}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Монгол улс
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 line-clamp-3 relative z-10 min-h-[4.5rem]">
                {company.bio || "Энэ компанийн тухай мэдээлэл одоогоор байхгүй байна."}
              </p>

              <div className="pt-6 sm:pt-8 border-t border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {company._count?.jobs || 0} Нээлттэй ажлын байр
                  </div>
                </div>
                <Link 
                  href={`/jobs?search=${encodeURIComponent(company.name || "")}`}
                  className="text-accent hover:text-accent/80 text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  Ажлын байрууд
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

