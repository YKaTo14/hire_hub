"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, DollarSign, FileText, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: 0,
    location: "",
    type: "FULL_TIME",
    category: "ENGINEERING",
    customCategory: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // include customCategory when OTHER is selected
      const payload: any = { ...formData };
      if (formData.category === 'OTHER' && formData.customCategory) {
        payload.customCategory = formData.customCategory;
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post job");
        return;
      }

      router.push("/jobs");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
      <Link 
        href="/jobs" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Ажлын байр руу буцах
      </Link>

      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-start gap-4 mb-8 sm:flex-row sm:items-center">
            <div className="bg-accent/10 p-3 rounded-2xl">
              <Briefcase className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Шинэ ажлын байр зарлах</h1>
              <p className="text-sm text-muted-foreground">Компанидаа тохирох шилдэг мэргэжилтнийг олж аваарай</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 ml-1">Ажлын нэр</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background/50 pl-12 pr-4 py-3.5 border border-border rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="ж.нь: Ахлах Программист"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-3 ml-1">Цалин (₮/сар)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                    className="w-full bg-background/50 pl-12 pr-4 py-3.5 border border-border rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                    placeholder="e.g. 5000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-3 ml-1">Төрөл</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-background/50 px-4 py-3.5 border border-border rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="FULL_TIME">Бүтэн цаг</option>
                  <option value="PART_TIME">Хагас цаг</option>
                  <option value="CONTRACT">Гэрээт</option>
                  <option value="INTERNSHIP">Дадлага</option>
                  <option value="REMOTE">Зайнаас</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 ml-1">Салбар / Ангилал</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-background/50 px-4 py-3.5 border border-border rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="ENGINEERING">Инженеринг / Техник</option>
                <option value="PRODUCT">Бүтээгдэхүүн</option>
                <option value="DESIGN">Дизайн</option>
                <option value="MARKETING">Маркетинг</option>
                <option value="SALES">Үйлчилгээ / Борлуулалт</option>
                <option value="FINANCE">Санхүү</option>
                <option value="HR">Хүний нөөц</option>
                <option value="OPERATIONS">Операци</option>
                <option value="CUSTOMER_SUPPORT">Хэрэглэгчийн дэмжлэг</option>
                <option value="OTHER">Бусад</option>
              </select>
              {formData.category === 'OTHER' && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Салбарын нэрээ бичнэ үү"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className="w-full bg-background/50 px-4 py-3.5 border border-border rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 ml-1">Байршил</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-background/50 pl-12 pr-4 py-3.5 border border-border rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="ж.нь: Улаанбаатар эсвэл Зайнаас"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 ml-1">Ажлын байрны тайлбар болон шаардлага</label>
              <div className="relative">
                <FileText className="absolute left-4 top-6 w-5 h-5 text-muted-foreground" />
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background/50 pl-12 pr-4 py-4 border border-border rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all min-h-[160px] sm:min-h-[200px] resize-none"
                  placeholder="Тавигдах шаардлага, хийж гүйцэтгэх ажил, ур чадвар, ажилласан жилийн тухай дэлгэрэнгүй бичнэ үү..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Зарлах
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

