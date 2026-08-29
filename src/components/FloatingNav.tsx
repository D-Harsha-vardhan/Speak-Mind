"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, BookOpen, Activity, Calendar, Plus } from "lucide-react";

interface FloatingNavProps {
  activeTab?: "home" | "journal" | "activities" | "profile";
}

export default function FloatingNav({ activeTab }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center justify-center">
        
        {/* Button 1: Home / Dashboard */}
        <Link
          href="/dashboard"
          style={{
            transform: isOpen ? "translate(-80px, -20px) scale(1)" : "translate(0px, 0px) scale(0.3)",
            opacity: isOpen ? 1 : 0,
          }}
          className={`absolute h-12 w-12 rounded-full border flex items-center justify-center shadow-xl transition-all duration-300 ease-out ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          } ${
            activeTab === "home"
              ? "bg-primary border-primary/20 text-primary-foreground font-bold"
              : "bg-card border-border text-foreground hover:bg-muted"
          }`}
          onClick={() => setIsOpen(false)}
          title="Dashboard"
        >
          <Compass className="h-5 w-5" />
        </Link>

        {/* Button 2: Daily Check-in */}
        <Link
          href="/check-in"
          style={{
            transform: isOpen ? "translate(-40px, -70px) scale(1)" : "translate(0px, 0px) scale(0.3)",
            opacity: isOpen ? 1 : 0,
          }}
          className={`absolute h-12 w-12 rounded-full border bg-card border-border text-foreground hover:bg-muted flex items-center justify-center shadow-xl transition-all duration-300 ease-out ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
          title="Mood Check-in"
        >
          <Calendar className="h-5 w-5" />
        </Link>

        {/* Button 3: Wellness Journal */}
        <Link
          href="/journal"
          style={{
            transform: isOpen ? "translate(40px, -70px) scale(1)" : "translate(0px, 0px) scale(0.3)",
            opacity: isOpen ? 1 : 0,
          }}
          className={`absolute h-12 w-12 rounded-full border flex items-center justify-center shadow-xl transition-all duration-300 ease-out ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          } ${
            activeTab === "journal"
              ? "bg-primary border-primary/20 text-primary-foreground font-bold"
              : "bg-card border-border text-foreground hover:bg-muted"
          }`}
          onClick={() => setIsOpen(false)}
          title="Journal"
        >
          <BookOpen className="h-5 w-5" />
        </Link>

        {/* Button 4: Coping Activities */}
        <Link
          href="/activities"
          style={{
            transform: isOpen ? "translate(80px, -20px) scale(1)" : "translate(0px, 0px) scale(0.3)",
            opacity: isOpen ? 1 : 0,
          }}
          className={`absolute h-12 w-12 rounded-full border flex items-center justify-center shadow-xl transition-all duration-300 ease-out ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          } ${
            activeTab === "activities"
              ? "bg-primary border-primary/20 text-primary-foreground font-bold"
              : "bg-card border-border text-foreground hover:bg-muted"
          }`}
          onClick={() => setIsOpen(false)}
          title="Activities"
        >
          <Activity className="h-5 w-5" />
        </Link>

        {/* Main Trigger Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 z-10 border border-white/10 bg-slate-900 text-white appearance-none outline-none focus:outline-none"
        >
          <Plus
            style={{
              transform: isOpen ? "rotate(135deg) scale(1.1)" : "rotate(0deg) scale(1)",
            }}
            className="h-6 w-6 transition-transform duration-300"
          />
        </button>
    </div>
  );
}
