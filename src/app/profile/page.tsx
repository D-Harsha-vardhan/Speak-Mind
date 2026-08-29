"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Moon,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Heart,
  Check,
  X
} from "lucide-react";

interface UserPreferences {
  dailyReminders?: boolean;
  focusAreas?: string[];
  communicationStyle?: string;
  [key: string]: any;
}

interface UserProfile {
  name: string;
  email: string;
  ageRange: string;
  preferences: UserPreferences;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // States for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [saving, setSaving] = useState(false);

  // Theme state
  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">("system");

  useEffect(() => {
    // Init theme
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setThemeMode(stored);
      } else {
        setThemeMode("system");
      }
    }

    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setEditName(data.user.name || "");
          setEditAge(data.user.ageRange || "");
        } else {
          router.push("/login");
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const toggleTheme = () => {
    const nextMode = themeMode === "system" ? "light" : themeMode === "light" ? "dark" : "system";
    setThemeMode(nextMode);
    
    if (nextMode === "system") {
      localStorage.removeItem("theme");
      document.documentElement.classList.remove("dark", "light");
    } else {
      localStorage.setItem("theme", nextMode);
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(nextMode);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, ageRange: editAge }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsEditing(false);
      }
    } catch (e) {
      console.error("Failed to save profile:", e);
    } finally {
      setSaving(false);
    }
  };

  const toggleReminders = async () => {
    if (!user) return;
    const currentVal = user.preferences?.dailyReminders !== false; // default true if undefined
    const newVal = !currentVal;
    
    // Optimistic update
    setUser({ ...user, preferences: { ...user.preferences, dailyReminders: newVal } });

    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: { ...user.preferences, dailyReminders: newVal }
        }),
      });
    } catch (e) {
      console.error("Failed to save preference:", e);
      // Revert on error
      setUser({ ...user, preferences: { ...user.preferences, dailyReminders: currentVal } });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-calm-gradient min-h-[100dvh]">
        <div className="text-muted-foreground animate-pulse font-medium text-sm">Loading profile...</div>
      </div>
    );
  }

  const remindersOn = user?.preferences?.dailyReminders !== false;

  return (
    <div className="flex flex-col flex-1 min-h-[100dvh] bg-background sm:bg-calm-gradient animate-in fade-in duration-200">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-12 flex flex-col flex-1">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary/10" />
            <span className="font-bold tracking-tight text-foreground">SpeakMind</span>
          </div>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pb-4">
          
          {/* Profile Card */}
          {isEditing ? (
            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-lg">Edit Profile</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm outline-none focus:border-primary/80"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Age Range</label>
                <select
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm outline-none focus:border-primary/80"
                >
                  <option value="Under 13">Under 13</option>
                  <option value="13-15">13-15</option>
                  <option value="16-18">16-18</option>
                  <option value="19-22">19-22</option>
                  <option value="23+">23+</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-xl border border-border text-sm font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex items-center gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/20 shrink-0">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {user?.name || "Reflector"}
                </h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-1 inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Age Range: {user?.ageRange || "Not set"}
                </div>
              </div>
            </div>
          )}

          {/* Settings Sections */}
          <div className="space-y-5">
            
            {/* Account Settings */}
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4">
                Account
              </h2>
              <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-between p-4 px-5 hover:bg-muted/50 transition-colors border-b border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Edit Profile</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => alert("Account preferences are currently tied to your onboarding. You can change them by creating a new account.")}
                  className="w-full flex items-center justify-between p-4 px-5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Account Preferences</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* App Preferences */}
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4">
                App Preferences
              </h2>
              <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
                <div className="w-full flex items-center justify-between p-4 px-5 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Daily Reminders</span>
                  </div>
                  {/* Toggle Switch */}
                  <button 
                    onClick={toggleReminders}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${remindersOn ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${remindersOn ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 px-5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Moon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Dark Theme</span>
                  </div>
                  <span className="text-xs text-muted-foreground italic capitalize">
                    {themeMode}
                  </span>
                </button>
              </div>
            </div>

            {/* Privacy & Danger Zone */}
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4">
                Privacy & Data
              </h2>
              <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
                <button 
                  onClick={() => alert("Your data is strictly private and stored securely. SpeakMind never shares your journals or check-ins.")}
                  className="w-full flex items-center justify-between p-4 px-5 hover:bg-muted/50 transition-colors border-b border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Privacy Policy</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 px-5 hover:bg-destructive/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5 text-destructive group-hover:text-destructive/80 transition-colors" />
                    <span className="text-sm font-bold text-destructive group-hover:text-destructive/80 transition-colors">Log Out</span>
                  </div>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
