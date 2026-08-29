import Link from "next/link";
import { Shield, PhoneCall, AlertTriangle, LifeBuoy } from "lucide-react";

export default function Safety() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <div className="flex flex-col gap-6 text-center sm:text-left mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Safety <span className="text-primary">First</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          SpeakMind is built with a deep commitment to safety. We believe AI should be a helper,
          not a clinical therapist, and it should actively direct users to human support when needed.
        </p>
      </div>

      {/* Safety Layer Explanation */}
      <div className="rounded-3xl border border-border bg-card p-8 mb-12 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Our Dedicated Safety Layer
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every conversation goes through our safety check system, which classifies message severity levels:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-secondary/30">
            <span className="font-semibold text-primary block mb-1">NORMAL & DISTRESS</span>
            Defused, supportive listening for everyday stresses (academic pressure, workload, sleep issues).
          </div>
          <div className="p-4 rounded-2xl bg-destructive/5 text-destructive-foreground">
            <span className="font-semibold text-destructive block mb-1">HIGH CONCERN</span>
            Self-harm thoughts trigger gentle overrides directing the user to text/call 988 immediately.
          </div>
        </div>
      </div>

      {/* Direct Resources */}
      <div className="rounded-3xl bg-secondary p-8 text-secondary-foreground shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-primary" />
          Real-World Support Resources
        </h2>
        <p className="text-sm leading-relaxed mb-6">
          If you or someone you know is in immediate danger or going through an emotional crisis,
          please use the following resources. They are completely free, confidential, and available 24/7:
        </p>

        <div className="space-y-4">
          <div className="rounded-2xl bg-card p-4 text-foreground shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-bold text-base block">988 Suicide & Crisis Lifeline</span>
              <span className="text-xs text-muted-foreground">Call or text 988 (USA/Canada) for immediate, confidential crisis counselors.</span>
            </div>
            <a
              href="tel:988"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow"
            >
              Call 988
            </a>
          </div>

          <div className="rounded-2xl bg-card p-4 text-foreground shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-bold text-base block">The Trevor Project</span>
              <span className="text-xs text-muted-foreground">Crisis intervention for LGBTQ+ young people. Call 1-866-488-7386 or text START to 678-678.</span>
            </div>
            <a
              href="https://www.thetrevorproject.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow"
            >
              Trevor Project
            </a>
          </div>

          <div className="rounded-2xl bg-card p-4 text-foreground shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-bold text-base block">Crisis Text Line</span>
              <span className="text-xs text-muted-foreground">Text HOME to 741741 to connect with a crisis counselor 24/7.</span>
            </div>
            <a
              href="sms:741741?body=HOME"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow"
            >
              Text HOME
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-muted-foreground max-w-xl mx-auto">
        <p className="flex items-center justify-center gap-1.5 mb-1.5 text-foreground font-semibold">
          <AlertTriangle className="h-4 w-4 text-primary" />
          SpeakMind is NOT a Therapist
        </p>
        AI conversation is here for general emotional reflection and everyday support. Never use it to replace professional care, psychologists, or counselors. Always consult a qualified professional for health advice.
      </div>
    </div>
  );
}
