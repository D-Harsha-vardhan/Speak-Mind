"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard/app routes for a clean app experience
  const isAppRoute = [
    "/dashboard",
    "/chat",
    "/check-in",
    "/journal",
    "/insights",
    "/activities",
    "/profile",
    "/settings",
    "/support",
    "/onboarding",
  ].some((route) => pathname.startsWith(route));

  if (isAppRoute) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo & Vision */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary/10" />
              <span className="text-lg font-bold tracking-tight">
                Speak<span className="text-primary">Mind</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              An AI-powered wellness companion designed to help young people reflect, understand emotional patterns, and build healthy everyday habits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-primary transition-colors">
                  Safety First
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency support warning */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">
              Important Notice
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              SpeakMind is a digital wellness tool providing supportive exercises and pattern identification. 
              <strong> It is not a therapist, does not diagnose, and cannot replace professional medical care.</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              If you are in distress or danger, please connect with a trusted person, counselor, or call/text <strong>988</strong> immediately.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SpeakMind. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/safety" className="hover:underline">Safety guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
