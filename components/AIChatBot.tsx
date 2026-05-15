"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Send, Bot, User, Loader2, Minimize2, Maximize2, X, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const hookPath = usePathname();
  const pathname = hookPath || (typeof window !== 'undefined' ? window.location.pathname : "/");

  const defaultAssistant = `Сайн байна уу! Би HireHub-ын AI туслах байна. Танд юугаар туслах вэ? Бид CV-ээ хэрхэн бичих, хэрэгцээт хэсгүүд, болон ажлын зар хэрхэн бичих талаар тусална.`;

  const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: defaultAssistant }
  ]);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Speak assistant responses when voice mode is enabled
  useEffect(() => {
    if (!voiceEnabled) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant' && typeof window !== 'undefined' && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(last.content);
      // Try Mongolian locale, fallback to default
      utter.lang = 'mn-MN';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, [messages, voiceEnabled]);

  useEffect(() => {
    return () => {
      // cleanup recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Уучлаарай, алдаа гарлаа. Дахин оролдоно уу." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input).then(() => setInput(""));

  const handleSuggestion = (text: string) => {
    // immediately send suggestion
    sendMessage(text);
  }

  const startRecording = () => {
    if (isRecording) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Таны хөтөч дэмжихгүй байна: микрофоны оролт боломжгүй.' }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'mn-MN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) finalTranscript += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (finalTranscript) {
        sendMessage(finalTranscript);
      } else {
        setInput(interim);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (!isRecording || !recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (e) {}
    recognitionRef.current = null;
    setIsRecording(false);
  };

  // determine hints based on pathname
  const path = pathname || "/";
  const commonHints = [
    "CV-г хэрхэн бичих: хэсгүүд болон жишээ",
    "CV-ээ тухайн ажлын байрт хэрхэн оновчтой болгох вэ",
    "Хүчтэй Summary/Objective хэрхэн бичих вэ"
  ];

  const jobSeekerHints = [
    "CV жишээ: Програм хангамжийн инженер (амжилтыг хэмжих оноогоор бичих)",
    "Хамгийн чухал ур чадваруудыг хэрхэн жагсаах вэ",
    "Cover letter-д юу бичих вэ (жишээ)"
  ];

  const employerHints = [
    "Ажлын байрны сайн зар хэрхэн бичих вэ (үлдмэл үүрэг, шаардлагууд, ашиг тус)",
    "Сонгон шалгаруулалтын шалгуур хэрхэн тогтоох вэ",
    "Ажил олгогчийн хувьд CV-ийг яаж хурдан шүүж унших вэ"
  ];

  const suggestions = path.startsWith("/dashboard") || path.startsWith("/post-job") || path.startsWith("/companies")
    ? [...commonHints, ...employerHints]
    : [...commonHints, ...jobSeekerHints];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-accent text-accent-foreground p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50 animate-bounce"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed right-6 bottom-6 bg-card border border-border shadow-2xl z-50 transition-all duration-300 flex flex-col",
      isMinimized ? "w-72 h-14 rounded-xl" : "w-[400px] h-[600px] rounded-3xl"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-accent/5 rounded-t-3xl">
        <div className="flex items-center gap-2">
          <div className="bg-accent/10 p-1.5 rounded-lg">
            <Bot className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-sm">HireHub AI Туслах</h3>
            {!isMinimized && <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Online</span>
            </div>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            aria-pressed={voiceEnabled}
            title={voiceEnabled ? "Voice mode on" : "Voice mode off"}
            className={"p-1.5 rounded-lg transition-colors " + (voiceEnabled ? "bg-accent/10 text-accent" : "hover:bg-muted")}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Suggestions / Hints */}
          <div className="px-4 pt-4">
            <div className="flex gap-2 flex-wrap">
              {suggestions.slice(0,6).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs px-3 py-1 bg-muted/50 hover:bg-muted rounded-full border border-border text-muted-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn(
                "flex items-start gap-2 max-w-[85%]",
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  m.role === "assistant" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                )}>
                  {m.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  m.role === "assistant" ? "bg-accent/5 text-foreground rounded-tl-none" : "bg-accent text-accent-foreground rounded-tr-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-accent/5 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="relative">
                <button
                  onClick={() => { if (isRecording) stopRecording(); else startRecording(); }}
                  aria-pressed={isRecording}
                  className={"absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full " + (isRecording ? "bg-red-500/20 text-red-500" : "bg-muted/20 text-muted-foreground")}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <Mic className="w-4 h-4" />
                </button>
              <input
                type="text"
                placeholder="Асуултаа энд бичнэ үү..."
                  className="w-full bg-muted/50 border border-border rounded-xl pl-12 pr-12 py-3 text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground p-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
