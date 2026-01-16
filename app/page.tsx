"use client";

import Link from "next/link";
import { CoralineStsoneLogo } from "@/components/ui/coraline-stone-logo";
import { Film, BookOpen, MapPin, ArrowRight } from "lucide-react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <CoralineStsoneLogo size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Storyline
            </span>
          </Link>
          <div className="flex items-center gap-4">

            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/30">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center space-y-8 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Track Your Story
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              Your Life&apos;s
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                Greatest Memories
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A premium personal tracker for movies, books, and travel
              experiences. Chronicle your journey with style.
            </p>

            <div className="flex items-center justify-center gap-4">
              <SignUpButton mode="modal">
                <button className="group flex items-center gap-2 px-8 py-4 text-lg font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105">
                  Start Your Story
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </SignUpButton>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {/* Movie Feature */}
            <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Film className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Movie Tracker</h3>
                <p className="text-muted-foreground">
                  Log every film you watch with ratings, notes, and IMDb
                  integration. Never forget a cinematic moment.
                </p>
              </div>
            </div>

            {/* Book Feature */}
            <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <BookOpen className="text-secondary" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Book Logs</h3>
                <p className="text-muted-foreground">
                  Chronicle your reading journey with detailed logs, ratings,
                  and reflections on every page turned.
                </p>
              </div>
            </div>

            {/* Travel Feature */}
            <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 hover:border-chart-3/50 transition-all duration-300 hover:shadow-xl hover:shadow-chart-3/10">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-3/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-chart-3/10 flex items-center justify-center mb-6">
                  <MapPin className="text-chart-3" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Travel Map</h3>
                <p className="text-muted-foreground">
                  Pin your adventures on an interactive map with photos and
                  memories from every destination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          <p>
            © 2026 Storyline. Crafted with ❤️ by{" "}
            <a
              href="https://notvikke.github.io/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Vignesh
            </a>
          </p>
        </div>
      </footer>

      {/* Gradient Animation */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
