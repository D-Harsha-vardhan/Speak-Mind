import Link from "next/link";
import { Heart, Shield, Users, Info } from "lucide-react";

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <div className="flex flex-col gap-6 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          About <span className="text-primary">SpeakMind</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          SpeakMind is an AI-powered early-support and emotional wellness platform
          designed specifically for teenagers, students, and young adults. Our
          vision is to provide a safe, private, and highly accessible digital space
          where young people can reflect on their thoughts, recognize emotional
          themes, and cultivate positive daily coping habits.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Safety & Support</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We are dedicated to safety first. SpeakMind is equipped with an
            advanced safety classification layer that detects signs of crisis. We
            do not replace human counselors, doctors, or parents; instead, we actively
            encourage and facilitate connection to trusted real-world support when it
            is needed most.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Privacy-First Design</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your conversations are yours. SpeakMind does not sell user data or expose
            private logs to school administrators, teachers, or parents by default.
            Users maintain full ownership and can request complete account and data
            deletion at any time with a single click.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl bg-secondary p-8 text-secondary-foreground">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          A Companion, Not a Clinician
        </h2>
        <p className="text-sm leading-relaxed opacity-95">
          SpeakMind does not diagnose clinical conditions (like anxiety or depression)
          and does not prescribe medication or clinical treatments. Instead, we study
          longitudinal patterns—like how academic stress fluctuates with sleep cycles—and
          explain those observations so you can build better everyday routines.
        </p>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/signup"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/95"
        >
          Create Your Safe Account
        </Link>
      </div>
    </div>
  );
}
