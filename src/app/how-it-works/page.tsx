import Link from "next/link";
import { MessageSquare, Heart, Shield, Activity, BarChart2 } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          How <span className="text-primary">SpeakMind</span> Works
        </h1>
        <p className="text-lg text-muted-foreground">
          SpeakMind is designed as a wellness intelligence system to guide your everyday reflection, step-by-step.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
            1
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Daily Mood Check-ins</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start your day with a simple question: "How are you feeling today?" 
              Select a non-clinical mood label (Great, Good, Okay, Low, Stressed, Overwhelmed) 
              and tag the elements affecting your day, such as academic workload or friendships.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
            2
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Reflective AI Conversation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chat with SpeakMind about your day, pressure points, or goals. Our AI is configured 
              with supportive, age-appropriate guidelines. It actively listens, reflects what 
              you say, and suggests short, non-clinical exercises.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
            3
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Safety and Guardrails</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Before your messages reach the AI, they pass through our dedicated safety 
              classification layer. If distress or self-harm thoughts are detected, the 
              system intervenes to guide you gently and directly toward crisis hotlines and 
              trusted real-world support.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
            4
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Longitudinal Pattern Detection</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SpeakMind goes beyond individual conversations. Our pattern engine correlates 
              your check-ins, journal entries, and chat themes over weeks. It surfaces 
              clear, explainable observations (e.g. "We noticed that academic workload frequently 
              correlates with lower sleep").
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
            5
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Practical Coping Activities</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on the patterns identified, SpeakMind recommends practical coping exercises from 
              our activity library: Guided breathing cycles, screen wind-downs, or micro-goal focus planners 
              to help you build everyday resilience.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/signup"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/95"
        >
          Start Your Journey
        </Link>
      </div>
    </div>
  );
}
