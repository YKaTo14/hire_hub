"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { FileText, X, CheckCircle2, Loader2, AlertCircle, Upload, FileUp } from "lucide-react";

interface ApplyModalProps {
  jobId: number;
  jobTitle: string;
  onClose: () => void;
}

export function ApplyModal({ jobId, jobTitle, onClose }: ApplyModalProps) {
  const [cvUrl, setCvUrl] = useState("");
  const [cvName, setCvName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!cvUrl) {
      setError("CV-гээ оруулна уу.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          jobId,
          coverLetter,
          cvUrl,
          cvName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Алдаа гарлаа");

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-[32px] p-12 max-w-sm w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Амжилттай!</h2>
          <p className="text-muted-foreground text-sm">Таны анкетыг компани руу илгээлээ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-[32px] shadow-2xl w-full max-w-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Ажилд анкет илгээх</h2>
            <p className="text-muted-foreground">{jobTitle}</p>
          </div>

          <div className="space-y-8">
            {/* CV Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-accent" />
                  CV (PDF формат)
                </label>
                {cvUrl && (
                  <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Сонгогдсон
                  </span>
                )}
              </div>
              
              {!cvUrl ? (
                <div className="relative group cursor-pointer overflow-hidden border-2 border-dashed border-border rounded-[24px] hover:border-accent transition-all duration-300">
                  <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors flex flex-col items-center justify-center p-8 pointer-events-none">
                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-sm font-bold mb-1">Файл хуулах</p>
                    <p className="text-xs text-muted-foreground">PDF файл сонгоно уу (макс 4MB)</p>
                  </div>
                  <div className="h-[160px] w-full flex items-center justify-center opacity-0">
                    <UploadButton
                      endpoint="pdfUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setCvUrl(res[0].url);
                          setCvName(res[0].name);
                          setError(""); // Амжилттай бол алдааг арилгах
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setError(`Алдаа: ${error.message}`);
                      }}
                      appearance={{
                        button: "w-full h-[160px] cursor-pointer",
                        allowedContent: "hidden"
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/10 p-3 rounded-xl shadow-sm">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold line-clamp-1">{cvName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Амжилттай хуулагдсан</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setCvUrl(""); setCvName(""); }}
                    className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                    title="Файлыг устгах"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Cover Letter Section */}
            <div>
              <label className="block text-sm font-bold mb-4">Танилцуулга / Cover Letter (Заавал биш)</label>
              <textarea 
                className="w-full bg-background border border-border rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-accent/50 min-h-[150px] resize-none transition-all"
                placeholder="Яагаад та энэ ажилд тохирох вэ? Төслийн туршлагаасаа хуваалцана уу..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-accent text-accent-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Анкет илгээх"}
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-muted text-muted-foreground py-4 rounded-2xl font-bold hover:bg-muted/80 transition-all"
              >
                Болих
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
