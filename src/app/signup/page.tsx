"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Lock, Mail, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Use window.location to ensure the browser has time to register the new cookie
      // before navigating, preventing middleware from accidentally blocking the request
      window.location.href = "/onboarding";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-calm-gradient min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md space-y-8 glass rounded-3xl p-8 shadow-lg border border-border/40">
        
        {/* Branding & Welcome */}
        <div className="text-center flex flex-col items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-primary fill-primary/10" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Speak<span className="text-primary">Mind</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Create Your Account
          </h2>
          <p className="text-sm text-muted-foreground">
            Begin your secure and private wellness journey today.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive-foreground text-center border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Preferred Name */}
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you? (Preferred name)"
              className="w-full rounded-2xl border border-border bg-card/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-2xl border border-border bg-card/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full rounded-2xl border border-border bg-card/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Privacy Note */}
          <div className="flex gap-2 rounded-2xl bg-primary/5 p-3.5 text-xs text-muted-foreground leading-relaxed border border-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <span>
              <strong>Privacy is our focus.</strong> We do not sell your data or share
              private conversations with administrators, teachers, or parents by default.
            </span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 hover:bg-primary/95 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Registering..." : "Start Your Wellness Journey"}
            {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
          </button>
        </form>

        <div className="text-center text-sm mt-4 text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
