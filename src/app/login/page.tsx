"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Lock, Mail, ArrowRight } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If redirected from a protected page, redirect back there after login
  const fromPath = searchParams.get("from") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      // Use window.location to ensure the browser has time to register the new cookie
      // before navigating, preventing middleware from accidentally blocking the request
      window.location.href = fromPath;
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
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground">
            Log in to continue reflecting on your wellness.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive-foreground text-center border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Password"
              className="w-full rounded-2xl border border-border bg-card/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right text-xs">
            <Link
              href="/forgot-password"
              className="font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102 hover:bg-primary/95 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Logging in..." : "Continue"}
            {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
          </button>
        </form>

        <div className="text-center text-sm mt-4 text-muted-foreground">
          New to SpeakMind?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center py-12 px-4 bg-calm-gradient min-h-[calc(100vh-4rem)]">
        <div className="text-center text-sm text-muted-foreground animate-pulse">Loading login screen...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
