"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Heart, Shield, Check, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form states
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [communicationStyle, setCommunicationStyle] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  // Load name on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setName(data.user.name || "");
          }
        }
      } catch (e) {
        console.error("Failed to load user name:", e);
      } finally {
        setFetchingUser(false);
      }
    }
    loadUser();
  }, []);

  const toggleFocus = (topic: string) => {
    if (selectedFocus.includes(topic)) {
      setSelectedFocus(selectedFocus.filter((t) => t !== topic));
    } else {
      setSelectedFocus([...selectedFocus, topic]);
    }
  };

  const focusOptions = [
    "Academic pressure",
    "Stress management",
    "Sleep routine",
    "Confidence",
    "Relationships/friendships",
    "Time management",
    "General emotional wellness",
    "Just checking in",
  ];

  const commStyles = [
    { label: "Warm & Gentle", value: "warm", desc: "Supportive, soft, and comforting responses." },
    { label: "Direct & Practical", value: "practical", desc: "Short, actionable strategies and coping habits." },
    { label: "Thought-Provoking", value: "reflective", desc: "Asks deeper questions to help you understand feelings." },
    { label: "Quiet Listener", value: "quiet", desc: "Focuses on reflecting what you write and letting you share." },
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      const preferences = {
        focusAreas: selectedFocus,
        communicationStyle,
        isOnboarded: true,
      };

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ageRange,
          preferences,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save onboarding details.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Something went wrong while completing onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="flex flex-1 items-center justify-center bg-calm-gradient min-h-screen">
        <div className="text-center text-muted-foreground animate-pulse">
          Loading onboarding...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background sm:bg-calm-gradient min-h-[100dvh] sm:py-12 sm:px-6 sm:items-center sm:justify-center">
      <div className="w-full h-full max-w-xl flex flex-col flex-1 sm:flex-none sm:space-y-6 sm:glass sm:rounded-3xl p-6 sm:p-8 sm:shadow-lg sm:border sm:border-border/40">
        
        <div className="space-y-4 flex-shrink-0 mb-6 sm:mb-0 pt-4 sm:pt-0">
          {/* Header Indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span className="font-semibold text-primary uppercase tracking-wider">Onboarding</span>
          <span>Step {step} of 4</span>
        </div>
        
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Name and Age */}
        {step === 1 && (
          <div className="flex flex-col flex-1 animate-in fade-in duration-200">
            <div className="space-y-2 mb-6 flex-shrink-0">
              <h2 className="text-2xl font-bold">Let's get to know you</h2>
              <p className="text-sm text-muted-foreground">
                We collect minimal details to personalize your wellness companion.
              </p>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Preferred Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your preferred name"
                  className="w-full rounded-2xl border border-border bg-card/50 py-3 px-4 text-sm outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Age Range</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Under 13", "13-15", "16-18", "19-22", "23+"].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAgeRange(age)}
                      className={`py-3 px-4 rounded-2xl text-sm font-medium border transition-all text-center ${
                        ageRange === age
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card/30 text-foreground hover:bg-muted/40"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex-shrink-0">
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim() || !ageRange}
                className="w-full flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 disabled:opacity-50 disabled:scale-100"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Focus Areas */}
        {step === 2 && (
          <div className="flex flex-col flex-1 animate-in fade-in duration-200">
            <div className="space-y-2 mb-6 flex-shrink-0">
              <h2 className="text-2xl font-bold">What's on your mind?</h2>
              <p className="text-sm text-muted-foreground">
                What areas would you like SpeakMind to help you with? (Select all that apply)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 pb-4 flex-1">
              {focusOptions.map((topic) => {
                const isSelected = selectedFocus.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleFocus(topic)}
                    className={`py-3 px-4 rounded-2xl text-sm font-medium border transition-all text-left flex justify-between items-center ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card/30 text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span>{topic}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-auto pt-4 flex-shrink-0">
              <button
                onClick={() => setStep(1)}
                className="w-1/2 flex h-11 items-center justify-center rounded-full border border-border text-sm font-semibold hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedFocus.length === 0}
                className="w-1/2 flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 disabled:opacity-50 disabled:scale-100"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Communication Style */}
        {step === 3 && (
          <div className="flex flex-col flex-1 animate-in fade-in duration-200">
            <div className="space-y-2 mb-6 flex-shrink-0">
              <h2 className="text-2xl font-bold">Your Preferred Vibe</h2>
              <p className="text-sm text-muted-foreground">
                Choose the tone you would like SpeakMind to use during chat support.
              </p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pb-4 pr-1">
              {commStyles.map((style) => {
                const isSelected = communicationStyle === style.value;
                return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setCommunicationStyle(style.value)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex justify-between items-start ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/30 hover:bg-muted/40"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-foreground">{style.label}</span>
                      <p className="text-xs text-muted-foreground leading-normal">{style.desc}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-auto pt-4 flex-shrink-0">
              <button
                onClick={() => setStep(2)}
                className="w-1/2 flex h-11 items-center justify-center rounded-full border border-border text-sm font-semibold hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!communicationStyle}
                className="w-1/2 flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 disabled:opacity-50 disabled:scale-100"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Privacy & Consent */}
        {step === 4 && (
          <div className="flex flex-col flex-1 animate-in fade-in duration-200">
            <div className="space-y-2 mb-6 flex-shrink-0">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Privacy Agreement
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Before we complete your setup, let's align on privacy boundaries:
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-4 text-sm text-muted-foreground leading-relaxed flex-1">
              <p>
                1. <strong>We do not share:</strong> Your daily check-ins, chats, and journal text remain strictly private to your account. We never expose them to parents, schools, or administrators.
              </p>
              <p>
                2. <strong>AI helper limits:</strong> SpeakMind is a supportive AI wellness companion. It is NOT a therapist or clinician, and cannot diagnose mental health conditions.
              </p>
              <p>
                3. <strong>Data deletion:</strong> You can completely delete your account and all associated wellness logs permanently at any time from your profile privacy panel.
              </p>
            </div>

            <div className="flex gap-3 mt-auto pt-6 flex-shrink-0">
              <button
                onClick={() => setStep(3)}
                className="w-1/2 flex h-11 items-center justify-center rounded-full border border-border text-sm font-semibold hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-1/2 flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 disabled:opacity-50 disabled:scale-100 text-black"
              >
                {loading ? "Saving..." : "Start Journey"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
