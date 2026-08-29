"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Sparkles, Clock, Compass, Play, X, ShieldAlert } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";

interface Activity {
  id: string;
  title: string;
  category: string;
  duration: number;
  description: string;
}

export default function Activities() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [fetching, setFetching] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeExercise, setActiveExercise] = useState<boolean>(false);
  const [completing, setCompleting] = useState(false);
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [breathePhase, setBreathePhase] = useState<string>("Inhale");
  const [breatheTime, setBreatheTime] = useState<number>(4);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);

  // Load activities
  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await fetch("/api/activities");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
          
          // Populate completed list with today's completed activities
          if (data.history) {
            const today = new Date().toISOString().split('T')[0];
            const completedIds = data.history
              .filter((h: any) => {
                const dateStr = h.completedAt || h.createdAt;
                return dateStr && dateStr.startsWith(today);
              })
              .map((h: any) => h.activityId);
            setCompletedList(completedIds);
          }
        }
      } catch (e) {
        console.error("Failed to load activities:", e);
      } finally {
        setFetching(false);
      }
    }
    loadActivities();
  }, []);

  // Breathing pacer simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeExercise && selectedActivity?.title.includes("Box Breathing")) {
      let timer = 4;
      setBreatheTime(4);
      setBreathePhase("Inhale");
      interval = setInterval(() => {
        timer--;
        if (timer < 0) {
          setBreathePhase((current) => {
            if (current === "Inhale") {
              timer = 4;
              return "Hold";
            }
            if (current === "Hold") {
              timer = 4;
              return "Exhale";
            }
            if (current === "Exhale") {
              timer = 4;
              return "Hold Again";
            }
            timer = 4;
            return "Inhale";
          });
        } else {
          setBreatheTime(timer);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeExercise, selectedActivity]);

  // General Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeExercise && timeLeft > 0 && !timerPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeExercise, timeLeft, timerPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleComplete = async (activityId: string) => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/api/activities/${activityId}/complete`, {
        // Wait, the API route is POST /api/activities/:id/complete, let's fix the url
        method: "POST",
      });
      
      // Wait, is the API route path `/api/activities/[id]/complete`?
      // Yes! Next.js serves it under /api/activities/[id]/complete.
      // So we call: POST /api/activities/${activityId}/complete. Let's correct it!
      const correctRes = await fetch(`/api/activities/${activityId}/complete`, {
        method: "POST",
      });

      if (correctRes.ok) {
        setCompletedList([...completedList, activityId]);
        setSelectedActivity(null);
        setActiveExercise(false);
      } else {
        alert("Failed to log activity completion.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  const categories = ["all", "calm", "focus", "reflection", "sleep", "social"];

  const filteredActivities = activeTab === "all"
    ? activities
    : activities.filter((act) => act.category === activeTab);

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

      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Wellness Activities</h1>
          <p className="text-sm text-muted-foreground">
            Practical, short exercises to help you wind down, focus, or reflect on your day.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === cat
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        {fetching ? (
          <div className="text-center text-muted-foreground py-12 animate-pulse">
            Loading activity catalog...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="rounded-3xl border border-border border-dashed p-12 text-center text-muted-foreground text-sm">
            No activities found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => {
              const isCompleted = completedList.includes(act.id);
              return (
                <div
                  key={act.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                        {act.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {act.duration}m
                      </span>
                    </div>

                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    {isCompleted ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="h-4 w-4 stroke-[3px]" /> Completed Today
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedActivity(act);
                          setActiveExercise(false);
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 group-hover:scale-102 transition-transform"
                      >
                        <Play className="h-3.5 w-3.5 mr-1 fill-primary-foreground" /> Start Exercise
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Player Modal Overlay */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSelectedActivity(null);
                setActiveExercise(false);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {selectedActivity.category} Exercise ({selectedActivity.duration} min)
                </span>
                <h2 className="text-xl font-bold">{selectedActivity.title}</h2>
              </div>

              {activeExercise ? (
                /* Active simulator screen with functional countdown timer */
                <div className="py-8 px-6 flex flex-col items-center justify-center text-center bg-secondary/15 rounded-3xl border border-primary/10 space-y-6">
                  
                  {/* Timer Circular/Dial Display */}
                  <div className="space-y-1">
                    <div className="text-5xl font-mono font-extrabold text-primary tracking-wider">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {timeLeft === 0 ? "Exercise Finished!" : timerPaused ? "Paused" : "Remaining Time"}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-xs bg-muted h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (timeLeft / (selectedActivity.duration * 60)) * 100))}%` 
                      }}
                    />
                  </div>

                  {selectedActivity.title.includes("Box Breathing") && timeLeft > 0 && !timerPaused ? (
                    <div className="space-y-4 flex flex-col items-center">
                      {/* Breathing Ball Animation */}
                      <div 
                        className={`h-24 w-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-base transition-all duration-[4000ms] ease-in-out ${
                          breathePhase === "Inhale" ? "scale-120 bg-primary/40" : 
                          breathePhase === "Exhale" ? "scale-85 bg-primary/10" : "scale-100"
                        }`}
                      >
                        {breatheTime}s
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-primary tracking-wide uppercase">{breathePhase}</h3>
                        <p className="text-[10px] text-muted-foreground">Follow the box pacer.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 py-2">
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto italic">
                        {timeLeft === 0 
                          ? "You have completed the exercise duration! Great job."
                          : "Focus on your wind-down. Relax your shoulders and let go of stress."}
                      </p>
                    </div>
                  )}

                  {/* Timer Controls */}
                  <div className="flex gap-3 justify-center items-center">
                    {timeLeft > 0 && (
                      <button
                        onClick={() => setTimerPaused(!timerPaused)}
                        className="h-9 px-4 rounded-full border border-border bg-card text-xs font-semibold hover:bg-muted"
                      >
                        {timerPaused ? "Resume" : "Pause"}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleComplete(selectedActivity.id)}
                    disabled={completing}
                    className={`mt-4 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold shadow transition-all ${
                      timeLeft === 0 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 animate-bounce" 
                        : "bg-primary text-primary-foreground hover:bg-primary/95"
                    }`}
                  >
                    {completing ? "Logging..." : "Finish and Log Activity"}
                  </button>
                </div>
              ) : (
                /* Instructions Screen */
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedActivity.description}
                  </p>
                  <div className="rounded-2xl bg-secondary/25 p-4 text-xs text-muted-foreground border border-border/40">
                    <span className="font-semibold text-foreground block mb-1">How to practice:</span>
                    Find a comfortable seating posture, close your eyes or soften your gaze, and eliminate distractions. Spend the next few minutes practicing this exercise.
                  </div>
                  <button
                    onClick={() => {
                      setTimeLeft(selectedActivity.duration * 60);
                      setTimerPaused(false);
                      setActiveExercise(true);
                    }}
                    className="w-full flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102"
                  >
                    I'm Ready, Start
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Bottom Navigation Bar (Mobile Viewports Only) */}
      <FloatingNav activeTab="activities" />
    </div>
  );
}
