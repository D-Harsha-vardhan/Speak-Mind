"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Menu, X, Shield, Activity, User, LogOut } from "lucide-react";

interface UserSession {
  name: string;
  email: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              name: data.user.name,
              email: data.user.email,
            });
          }
        }
      } catch (e) {
        console.error("Navigation session check error:", e);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const navLinks = [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Safety First", href: "/safety" },
    { name: "Privacy", href: "/privacy" },
    { name: "About", href: "/about" },
  ];

  // Do not show main navbar on dashboard/app routes to allow dedicated layouts
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
    return null; // The main app shell will handle its own layout/sidebar/bottom bar
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <Heart className="h-6 w-6 text-primary fill-primary/10 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Speak<span className="text-primary">Mind</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-transform hover:scale-102 hover:bg-primary/90"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-transform hover:scale-102 hover:bg-primary/90"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border/40 bg-background/95 py-3 px-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-muted ${
                  pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-border/40 pb-3 pt-4">
            {!loading && (
              <div className="flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center justify-center rounded-full border border-border py-2 text-sm font-medium text-destructive hover:bg-destructive/5"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center rounded-full border border-border py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
