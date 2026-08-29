"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-calm-gradient min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md space-y-8 glass rounded-3xl p-8 shadow-lg border border-border/40 text-center">
        
        {/* Branding */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-primary fill-primary/10" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Speak<span className="text-primary">Mind</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Reset Your Password
          </h2>
        </div>

        {submitted ? (
          <div className="space-y-4 py-4 flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-primary" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Check your inbox</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mx-auto">
                If an account exists for <strong>{email}</strong>, we have sent password reset instructions. (Demo Mode: No actual email is sent.)
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow"
            >
              Return to Log In
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-2xl border border-border bg-card/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all text-foreground"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-102"
            >
              Send Reset Link
            </button>

            <div className="text-sm mt-4 text-muted-foreground">
              Back to{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
