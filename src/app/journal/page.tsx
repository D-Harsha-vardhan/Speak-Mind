"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Trash2, CheckCircle, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";

interface JournalEntry {
  id: string;
  content: string;
  aiAnalysisEnabled: boolean;
  createdAt: string;
}

interface AIReflection {
  summary: string;
  themes: string[];
  reflectionQuestion: string;
  suggestedActivityCategory: string;
}

export default function Journal() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [reflection, setReflection] = useState<AIReflection | null>(null);

  // Load past entries
  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetch("/api/journal");
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch (e) {
        console.error("Failed to load journal entries:", e);
      } finally {
        setFetching(false);
      }
    }
    loadEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setReflection(null);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, aiAnalysisEnabled }),
      });

      const data = await res.json();

      if (res.ok) {
        setContent("");
        // Insert new entry at the top
        setEntries([data.entry, ...entries]);
        if (data.aiReflection) {
          setReflection(data.aiReflection);
        }
      } else {
        alert("Failed to save journal entry.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit journal entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("handleDelete called for ID:", id);
    if (!confirm("Are you sure you want to permanently delete this journal entry? This cannot be undone.")) {
      console.log("Delete cancelled by user");
      return;
    }

    try {
      console.log(`Sending DELETE request to /api/journal/${id}...`);
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      console.log("DELETE response status:", res.status);
      
      if (res.ok) {
        console.log("Delete successful, updating state");
        setEntries(entries.filter((entry) => entry.id !== id));
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Delete failed, server error:", errData);
        alert(`Failed to delete journal entry: ${errData.error || res.statusText}`);
      }
    } catch (e) {
      console.error("DELETE request error:", e);
      alert("Failed to delete journal entry.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Compose and AI Reflection Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass rounded-3xl p-6 sm:p-8 shadow-sm border border-border/40 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Wellness Journal</h1>
              <p className="text-sm text-muted-foreground">
                Write down your thoughts, reflections, or how your day went. Keeping a journal helps trace your emotions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely here..."
                rows={6}
                required
                className="w-full rounded-2xl border border-border bg-card/40 py-3.5 px-4 text-sm outline-none focus:border-primary/85 focus:ring-1 focus:ring-primary/40 text-foreground resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 text-xs text-muted-foreground select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiAnalysisEnabled}
                    onChange={(e) => setAiAnalysisEnabled(e.target.checked)}
                    className="rounded text-primary border-border bg-card/30 focus:ring-primary/50"
                  />
                  <span>Enable optional AI reflection assistant</span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? "Analyzing..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>

          {/* AI Reflection Output */}
          {reflection && (
            <div className="rounded-3xl border border-primary/20 bg-secondary/20 p-6 shadow-sm border-l-4 border-l-primary space-y-4 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                SpeakMind AI Reflection
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-foreground">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{reflection.summary}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  Reflection Question
                </h3>
                <p className="text-sm text-foreground font-medium italic">"{reflection.reflectionQuestion}"</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {reflection.themes.map((theme) => (
                  <span key={theme} className="py-1 px-2.5 rounded-full bg-primary/10 text-primary">
                    #{theme}
                  </span>
                ))}
                <span className="py-1 px-2.5 rounded-full bg-accent/10 text-accent font-medium">
                  Activity: {reflection.suggestedActivityCategory.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Past Entries List Area */}
        <div className="lg:col-span-5 space-y-4 max-h-[600px] overflow-y-auto pr-1">
          <h2 className="text-lg font-bold flex items-center gap-2 px-1">
            <BookOpen className="h-4 w-4 text-primary" />
            Past Entries ({entries.length})
          </h2>

          {fetching ? (
            <div className="text-center text-xs text-muted-foreground py-10 animate-pulse">
              Loading entries...
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-3xl border border-border border-dashed p-10 text-center text-xs text-muted-foreground leading-relaxed">
              Your journal list is empty. Write your first entry to see it logged here.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3 relative group">
                  <div className="flex justify-between items-center text-xs text-muted-foreground border-b border-border/40 pb-2">
                    <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 hover:text-destructive text-muted-foreground hover:bg-destructive/5 rounded transition-all"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      
      {/* Floating Bottom Navigation Bar (Mobile Viewports Only) */}
      <FloatingNav activeTab="journal" />
    </div>
  );
}
