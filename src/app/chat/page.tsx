"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Shield,
  Brain,
  MessageSquare,
  AlertTriangle,
  FileText,
  Activity,
  Menu,
  X,
} from "lucide-react";
import WaveVisualizer from "@/components/WaveVisualizer";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  
  // Loading & UI States
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);



  // 1. Fetch chat history and conversation list
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch("/api/chat/history");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
          
          // Auto-select latest conversation if available
          if (data.conversations && data.conversations.length > 0) {
            handleSelectConversation(data.conversations[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load conversations:", e);
      } finally {
        setFetchingHistory(false);
      }
    }
    loadConversations();
  }, []);

  // 2. Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSelectConversation = async (id: string) => {
    setConversationId(id);
    try {
      const res = await fetch(`/api/chat/history?conversationId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startNewConversation = async () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setInputText("");
    setLoading(true);

    // Append user message instantly
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Real Call to Backend API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          conversationId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!conversationId) {
          setConversationId(data.conversationId);
          // Refresh list of conversations
          const histRes = await fetch("/api/chat/history");
          if (histRes.ok) {
            const histData = await histRes.json();
            setConversations(histData.conversations || []);
          }
        }

        // Append assistant response
        const assistantMsg: Message = {
          id: Math.random().toString(),
          role: "assistant",
          content: data.response,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error(e);
      
      const errorMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: "SpeakMind is having trouble connecting right now. Let's take a slow breath and try again in a moment.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
      
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3 z-30 shrink-0">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 rounded-xl hover:bg-muted text-foreground transition-colors"
          title="Open conversation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-sm text-foreground">SpeakMind Companion</span>
        <div className="w-9"></div> {/* Empty spacer for center alignment */}
      </div>

      {/* Dim backdrop layer for Menu drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-all"
        />
      )}

      {/* Sidebar - Historical Threads */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-card p-4 flex flex-col gap-4 border-r border-border transition-transform duration-300 transform lg:static lg:translate-x-0 h-full shrink-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between lg:hidden mb-2">
          <span className="font-bold text-sm">Conversations</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="p-1 rounded-md hover:bg-muted"
            title="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </button>

        <button
          onClick={() => {
            startNewConversation();
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex h-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
        >
          + New Discussion Thread
        </button>

        <div className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-14rem)] lg:max-h-none pr-1">
          <span className="text-xs font-bold text-muted-foreground block px-2">Active Conversations</span>
          {fetchingHistory ? (
            <div className="text-xs text-muted-foreground text-center py-4 animate-pulse">Loading threads...</div>
          ) : conversations.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">No logged discussions.</div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    handleSelectConversation(conv.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs truncate transition-all ${
                    conversationId === conv.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Thread {conv.id.substring(0, 6)}...
                  <span className="block text-[10px] text-muted-foreground/60 font-normal">
                    {new Date(conv.createdAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col justify-between p-4 md:p-6 lg:p-8 space-y-4 h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[150px]">
          {messages.length === 0 ? (
            /* Starter Prompts */
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto py-8 w-full">
              <WaveVisualizer />
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Talk to SpeakMind</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I'm your secure, supportive wellness companion. You can write about stress, academic pressure, or whatever is on your mind.
                </p>
              </div>


            </div>
          ) : (
            /* Chat Bubbles */
            <div className="space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] lg:max-w-[75%] rounded-3xl p-4 text-sm leading-relaxed ${
                        isAssistant
                          ? "bg-card border border-border text-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-3xl p-4 bg-card border border-border rounded-tl-none text-muted-foreground flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Text Input Panel */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex gap-2 items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write your response here..."
            disabled={loading}
            className="flex-1 rounded-full border border-border bg-card/60 py-3 px-5 text-sm outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 text-foreground disabled:opacity-50 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/95 transition-transform hover:scale-103 disabled:opacity-50 disabled:scale-100 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
