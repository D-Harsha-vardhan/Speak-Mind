"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Check, Sparkles } from "lucide-react";

const MOODS = [
  { label: "Great", emoji: "😊", color: "hover:border-emerald-500 hover:bg-emerald-500/5 text-emerald-600 bg-emerald-50" },
  { label: "Good", emoji: "🙂", color: "hover:border-teal-500 hover:bg-teal-500/5 text-teal-600 bg-teal-50" },
  { label: "Okay", emoji: "😐", color: "hover:border-blue-500 hover:bg-blue-500/5 text-blue-600 bg-blue-50" },
  { label: "Low", emoji: "😔", color: "hover:border-indigo-500 hover:bg-indigo-500/5 text-indigo-600 bg-indigo-50" },
  { label: "Stressed", emoji: "😰", color: "hover:border-amber-500 hover:bg-amber-500/5 text-amber-600 bg-amber-50" },
  { label: "Overwhelmed", emoji: "😫", color: "hover:border-rose-500 hover:bg-rose-500/5 text-rose-600 bg-rose-50" },
];

const FACTORS = [
  "Academics",
  "Workload",
  "Sleep",
  "Relationships/friendships",
  "Family",
  "Social situations",
  "Confidence",
  "Future concerns",
  "Time management",
];

export default function CheckIn() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter((f) => f !== factor));
    } else {
      setSelectedFactors([...selectedFactors, factor]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodLabel: selectedMood,
          themes: selectedFactors.map((f) => {
            // Map the factor string to lowercase theme slugs for DB patterns
            if (f.startsWith("Relationships")) return "relationships";
            return f.toLowerCase().replace(" ", "_");
          }),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } else {
        alert("Failed to save check-in. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit check-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {submitted ? (
        <div className="glass rounded-3xl p-10 text-center flex flex-col items-center gap-4 py-16 shadow-md">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Check-in Logged!</h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-normal">
            Thank you for checking in. SpeakMind will study your reflections to identify your wellness patterns.
          </p>
        </div>
      ) : (
        <div className="glass rounded-3xl p-6 sm:p-8 shadow-md space-y-8 border border-border/40">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Wellness Check-in</h1>
            <p className="text-sm text-muted-foreground">
              Take a moment to check in with yourself. How is today going?
            </p>
          </div>

          {/* Mood Selectors */}
          <div className="space-y-3">
            <label className="text-sm font-semibold block text-foreground/80">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.label;
                return (
                  <button
                    key={mood.label}
                    type="button"
                    onClick={() => setSelectedMood(mood.label)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-start gap-1.5 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm scale-102"
                        : `border-border bg-card/30 hover:bg-muted/40`
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="font-bold text-sm text-foreground">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Factor Tags */}
          <div className="space-y-3">
            <label className="text-sm font-semibold block text-foreground/80">
              What has been affecting your day the most?
            </label>
            <div className="flex flex-wrap gap-2">
              {FACTORS.map((factor) => {
                const isSelected = selectedFactors.includes(factor);
                return (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => toggleFactor(factor)}
                    className={`py-2 px-3 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {factor}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedMood || loading}
            className="w-full flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Logging check-in..." : "Log Check-in"}
          </button>

        </div>
      )}
    </div>
  );
}
