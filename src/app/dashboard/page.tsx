"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Calendar,
  BookOpen,
  Activity,
  Compass,
  Settings,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  LineChart,
} from "lucide-react";
import FloatingNav from "@/components/FloatingNav";

interface UserProfile {
  name: string;
  email: string;
  ageRange: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic checklist and stats state
  const [stats, setStats] = useState({
    checkinsCount: 0,
    journalCount: 0,
    historyCount: 0,
  });
  
  const [latestCheckin, setLatestCheckin] = useState<any>(null);

  // New state for raw data and streak interaction
  const [allCheckins, setAllCheckins] = useState<any[]>([]);
  const [allJournals, setAllJournals] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [selectedStreakDate, setSelectedStreakDate] = useState<Date | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const profileRes = await fetch("/api/auth/me");
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.user) {
            setUser({
              name: data.user.name,
              email: data.user.email,
              ageRange: data.user.ageRange,
            });
          }
        } else {
          router.push("/login");
          return;
        }

        // Fetch counts for checkins, journals, and activity completions
        const [checkinsRes, journalRes, activitiesRes] = await Promise.all([
          fetch("/api/checkins"),
          fetch("/api/journal"),
          fetch("/api/activities"),
        ]);

        let cCount = 0;
        let jCount = 0;
        let hCount = 0;

        if (checkinsRes.ok) {
          const checkinsData = await checkinsRes.json();
          const checkinsList = checkinsData.checkins || [];
          setAllCheckins(checkinsList);
          cCount = checkinsList.length;
          if (checkinsList.length > 0) {
            const sorted = [...checkinsList].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setLatestCheckin(sorted[0]);
          }
        }

        if (journalRes.ok) {
          const journalData = await journalRes.json();
          const journalsList = journalData.entries || [];
          setAllJournals(journalsList);
          jCount = journalsList.length;
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          const activitiesList = activitiesData.history || [];
          setAllActivities(activitiesList);
          hCount = activitiesList.length;
        }

        setStats({
          checkinsCount: cCount,
          journalCount: jCount,
          historyCount: hCount,
        });

      } catch (e) {
        console.error("Dashboard profile fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-calm-gradient min-h-screen">
        <div className="text-muted-foreground animate-pulse font-medium text-sm">Loading dashboard...</div>
      </div>
    );
  }

  // Calculate dynamic wellness scores
  const moodScore = latestCheckin ? latestCheckin.moodLabel : "Not logged";
  const logsCompleted = (stats.checkinsCount > 0 ? 1 : 0) + (stats.journalCount > 0 ? 1 : 0) + (stats.historyCount > 0 ? 1 : 0);

  // Helper to check if two dates are same day
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

  // Generate last 7 days array for streak
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    
    const checkinsForDay = allCheckins.filter(c => isSameDay(new Date(c.createdAt), d));
    const journalsForDay = allJournals.filter(j => isSameDay(new Date(j.createdAt), d));
    const activitiesForDay = allActivities.filter(a => isSameDay(new Date(a.completedAt || a.createdAt), d));
    
    return {
      date: d,
      dayStr: d.toLocaleDateString("en-US", { weekday: "short" }),
      active: checkinsForDay.length > 0 || journalsForDay.length > 0 || activitiesForDay.length > 0,
      checkins: checkinsForDay,
      journals: journalsForDay,
      activities: activitiesForDay,
    };
  });

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-4rem)] relative pb-24 md:pb-0 bg-background text-foreground">
      {/* Sidebar Navigation - Desktop Viewport */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card p-6 flex-col gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary/10" />
          <span className="text-lg font-bold tracking-tight text-foreground font-bold">SpeakMind</span>
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-primary/10 text-primary text-sm font-medium">
            <Compass className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground">
            <MessageSquare className="h-4 w-4" />
            AI Companion
          </Link>
          <Link href="/check-in" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground">
            <Calendar className="h-4 w-4" />
            Daily Check-in
          </Link>
          <Link href="/journal" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground">
            <BookOpen className="h-4 w-4" />
            Wellness Journal
          </Link>
          <Link href="/activities" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground">
            <Activity className="h-4 w-4" />
            Activities
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-destructive/5 text-sm font-medium text-muted-foreground hover:text-destructive text-left mt-auto">
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 max-w-4xl mx-auto w-full">
        {/* Welcome header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">My Workspace</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Hello, {user?.name || "Reflector"}
            </h1>
          </div>
          <Link href="/profile" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-border hover:bg-muted transition-colors">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>

        {/* 🌟 New Feature: Interactive AI Assistant Feedback Capsule */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-muted-foreground">Live AI Wellness Insights</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {logsCompleted === 0
                ? "Your dashboard is ready! Log your mood or start an exercise to unlock dynamic reflections."
                : `Based on your ${logsCompleted} activity inputs today, your wellness balance is growing. Take a slow deep breath.`}
            </p>
          </div>
          <Link
            href="/chat"
            className="shrink-0 flex items-center gap-2 text-xs font-bold text-primary-foreground bg-primary px-4 py-2.5 rounded-full hover:scale-102 transition-all shadow-md"
          >
            Start Chat
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 🌟 Redesigned Analytics Wave Widget (Left Phone in screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Streak Widget (Spans 2 cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 pb-6 border-b border-border/40">
              <Calendar className="h-6 w-6 text-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Streak</h2>
            </div>

            <div className="flex items-center justify-between w-full pt-8 px-1 sm:px-4">
              {last7Days.map((item, i) => {
                const isSelected = selectedStreakDate && isSameDay(item.date, selectedStreakDate);
                return (
                  <div key={i} className="flex flex-col items-center gap-4 relative">
                    <span className={`text-sm md:text-base font-medium transition-colors ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
                      {item.dayStr}
                    </span>
                    <button 
                      onClick={() => setSelectedStreakDate(isSelected ? null : item.date)}
                      className={`flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                        item.active 
                          ? isSelected 
                            ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(208,240,37,0.4)] ring-2 ring-primary ring-offset-2 ring-offset-background" 
                            : "bg-[#F3E8FF] text-[#A855F7] dark:bg-[#F3E8FF]/20 dark:text-[#c084fc] hover:shadow-lg cursor-pointer"
                          : isSelected
                            ? "bg-muted ring-2 ring-muted-foreground ring-offset-2 ring-offset-background"
                            : "bg-muted hover:bg-muted/80 cursor-pointer" 
                      }`}
                    >
                      {item.active && (
                        <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Expandable Details Panel using Framer Motion */}
            <AnimatePresence>
              {selectedStreakDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full overflow-hidden"
                >
                  <div className="rounded-2xl bg-muted/30 p-5 border border-border/40 backdrop-blur-sm shadow-inner relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm text-foreground">
                        Activity on {selectedStreakDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h3>
                      <button onClick={() => setSelectedStreakDate(null)} className="text-muted-foreground hover:text-foreground bg-background rounded-full p-1 border border-border shadow-sm transition-transform hover:scale-110">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    
                    {(() => {
                      const dayData = last7Days.find(d => isSameDay(d.date, selectedStreakDate));
                      if (!dayData || !dayData.active) {
                        return (
                          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                            <span className="text-3xl">🧘‍♂️</span>
                            <p className="text-sm font-medium text-muted-foreground">A restful day. No wellness activities logged.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {dayData.checkins.length > 0 && (
                            <div className="bg-card p-4 rounded-xl border border-border/60 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                              <div className="flex items-center gap-2 mb-3 text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase">
                                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> Check-ins
                              </div>
                              {dayData.checkins.map((c: any, i: number) => (
                                <div key={i} className="text-sm font-semibold capitalize text-foreground">{c.moodLabel} mood</div>
                              ))}
                            </div>
                          )}
                          {dayData.journals.length > 0 && (
                            <div className="bg-card p-4 rounded-xl border border-border/60 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                              <div className="flex items-center gap-2 mb-3 text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase">
                                <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Journals
                              </div>
                              <div className="text-sm font-semibold text-foreground">{dayData.journals.length} entr{dayData.journals.length > 1 ? 'ies' : 'y'} written</div>
                            </div>
                          )}
                          {dayData.activities.length > 0 && (
                            <div className="bg-card p-4 rounded-xl border border-border/60 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                              <div className="flex items-center gap-2 mb-3 text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase">
                                <Activity className="w-3.5 h-3.5 text-emerald-500" /> Exercises
                              </div>
                              <div className="text-sm font-semibold text-foreground">{dayData.activities.length} completed</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Metrics Widget Panel (Spans 1 col) */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Wellness Activity</span>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Logged Check-ins</span>
                  <span className="text-sm font-extrabold text-foreground">{stats.checkinsCount}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Journal Entries</span>
                  <span className="text-sm font-extrabold text-foreground">{stats.journalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Completed Tasks</span>
                  <span className="text-sm font-extrabold text-foreground">{stats.historyCount}</span>
                </div>
              </div>
            </div>

            <Link
              href="/activities"
              className="w-full flex h-11 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:scale-102 transition-all"
            >
              Explore Exercises
            </Link>
          </div>

        </div>

        {/* 🌟 New Feature: Interactive Wellness Check-in Checklist */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-bold">Daily Objectives</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Objective 1: Check-in */}
            <Link
              href="/check-in"
              className="rounded-3xl border border-border/60 bg-card p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:bg-card/90"
            >
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-foreground block">Log Today's Mood</span>
                <span className="text-[10px] text-muted-foreground block">
                  {stats.checkinsCount > 0 ? "Completed today" : "Not logged yet"}
                </span>
              </div>
              <CheckCircle2
                className={`h-6 w-6 ${stats.checkinsCount > 0 ? "text-primary fill-foreground" : "text-muted-foreground/30"}`}
              />
            </Link>

            {/* Objective 2: Write Journal */}
            <Link
              href="/journal"
              className="rounded-3xl border border-border/60 bg-card p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:bg-card/90"
            >
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-foreground block">Reflect in Journal</span>
                <span className="text-[10px] text-muted-foreground block">
                  {stats.journalCount > 0 ? "Completed today" : "Write your thoughts"}
                </span>
              </div>
              <CheckCircle2
                className={`h-6 w-6 ${stats.journalCount > 0 ? "text-primary fill-foreground" : "text-muted-foreground/30"}`}
              />
            </Link>

            {/* Objective 3: Cope Exercises */}
            <Link
              href="/activities"
              className="rounded-3xl border border-border/60 bg-card p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:bg-card/90"
            >
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-foreground block">Wellness Activity</span>
                <span className="text-[10px] text-muted-foreground block">
                  {stats.historyCount > 0 ? "Completed today" : "Log 1 exercise"}
                </span>
              </div>
              <CheckCircle2
                className={`h-6 w-6 ${stats.historyCount > 0 ? "text-primary fill-foreground" : "text-muted-foreground/30"}`}
              />
            </Link>

          </div>
        </div>

        {/* Recent Mood Check-in Card (Matches screenshot submitted style) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-bold font-bold">Recent Status</h2>
          {latestCheckin ? (
            <div className="rounded-3xl border border-border bg-card p-5 flex justify-between items-center shadow-sm">
              <div className="space-y-1">
                <span className="text-sm font-bold text-foreground block">
                  Current Mood: {latestCheckin.moodLabel}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Logged on {new Date(latestCheckin.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </span>
              </div>
              <span className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold text-foreground uppercase">
                SUBMITTED
              </span>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No recent logs submitted yet.
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Radial Navigation (Mobile Viewports Only) */}
      <FloatingNav activeTab="home" />
    </div>
  );
}

// Simple profile icon component fallback
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
