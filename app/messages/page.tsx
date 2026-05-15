"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Briefcase, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  receiverId: number;
  sender: { id: number; name: string };
  receiver: { id: number; name: string };
}

interface Conversation {
  otherUser: { id: number; name: string; email: string };
  lastMessage: Message;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
    
    // URL-аас userId-г авч сонгох
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    
    fetchConversations(userId ? parseInt(userId) : null);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      const interval = setInterval(() => fetchMessages(selectedUser.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async (autoSelectId: number | null = null) => {
    try {
      setLoading(true);
      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      
      let currentConvs = data.conversations || [];
      setConversations(currentConvs);
      
      if (autoSelectId) {
        const existingConv = currentConvs.find((c: Conversation) => c.otherUser.id === autoSelectId);
        if (existingConv) {
          setSelectedUser(existingConv.otherUser);
        } else {
          // Шинэ хэрэглэгч бол хэрэглэгчийн мэдээллийг авах
          const userRes = await fetch(`/api/users/${autoSelectId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          const userData = await userRes.json();
          if (userData.user) {
            setSelectedUser(userData.user);
            // Жагсаалтад түр нэмэх (мессеж бичихээс өмнө)
            const placeholderConv: Conversation = {
              otherUser: userData.user,
              lastMessage: {
                id: 0,
                content: "Шинэ харилцан яриа...",
                createdAt: new Date().toISOString(),
                senderId: currentUser?.id,
                receiverId: userData.user.id,
                sender: currentUser,
                receiver: userData.user
              }
            };
            setConversations([placeholderConv, ...currentConvs]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const res = await fetch(`/api/messages?userId=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedUser.id
        })
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...messages, data.message]);
        setNewMessage("");
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-10rem)]">
      <div className="bg-card border border-border rounded-3xl overflow-hidden h-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-80 border-r border-border flex flex-col bg-muted/30">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Мессежүүд
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Мессеж байхгүй байна
              </div>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.otherUser.id}
                onClick={() => setSelectedUser(conv.otherUser)}
                className={cn(
                  "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group",
                  selectedUser?.id === conv.otherUser.id 
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                    : "hover:bg-card border border-transparent hover:border-border"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border",
                  selectedUser?.id === conv.otherUser.id ? "bg-white/20 border-white/30" : "bg-muted border-border"
                )}>
                  {conv.otherUser.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold truncate">{conv.otherUser.name}</h3>
                    <span className={cn(
                      "text-[10px] whitespace-nowrap",
                      selectedUser?.id === conv.otherUser.id ? "text-accent-foreground/70" : "text-muted-foreground"
                    )}>
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs truncate",
                    selectedUser?.id === conv.otherUser.id ? "text-accent-foreground/80" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage.content}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-background">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl flex items-center justify-center font-bold text-lg text-accent border border-accent/20">
                    {selectedUser.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Онлайн
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
              >
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%] md:max-w-[70%]",
                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        isMe 
                          ? "bg-accent text-accent-foreground rounded-tr-none shadow-lg shadow-accent/10" 
                          : "bg-card border border-border rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-2 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-4 md:p-6 border-t border-border bg-card/50">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Мессеж бичих..."
                    className="flex-1 bg-background border border-border rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-accent text-accent-foreground px-6 md:px-8 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden md:inline">Илгээх</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="bg-muted w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-8 border border-border">
                <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Таны харилцан ярианууд</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Зүүн талын жагсаалтаас хэрэглэгч сонгож мессеж бичнэ үү.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
