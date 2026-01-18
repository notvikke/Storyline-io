"use client";

import Link from "next/link";
import { CoralineStsoneLogo } from "@/components/ui/coraline-stone-logo";
import { Film, BookOpen, MapPin, ArrowRight, Tv, Users, Calendar } from "lucide-react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "@/components/footer";

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

          {/* Features Grid (Bento Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-20">
            {/* Row 1 */}

            {/* Card A: Media Tracker (Wide) */}
            <div className="col-span-1 md:col-span-4 group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Film className="text-primary" size={24} />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Tv className="text-primary" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">The Media Tracker</h3>
                <p className="text-muted-foreground text-lg">
                  Movies & TV Shows. Track what you watch, rate seasons, and never forget a plot twist.
                </p>
              </div>
            </div>

            {/* Card B: Book Logs (Square) */}
            <div className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <BookOpen className="text-secondary" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Book Logs</h3>
                <p className="text-muted-foreground">
                  Chapter by chapter tracking for the avid reader.
                </p>
              </div>
            </div>

            {/* Row 2 */}

            {/* Card C: Global Traveler (Square) */}
            <div className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:border-chart-3/50 transition-all duration-300 hover:shadow-xl hover:shadow-chart-3/10">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-3/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center mb-6">
                  <MapPin className="text-chart-3" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Global Traveler</h3>
                <p className="text-muted-foreground">
                  Pin your adventures and store memories on your interactive world map.
                </p>
              </div>
            </div>

            {/* Card D: Social Connections (Wide) */}
            <div className="col-span-1 md:col-span-4 group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <Users className="text-violet-500" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Social Connections</h3>
                <p className="text-muted-foreground text-lg">
                  Connect with friends. Share your profile, view their logs, and sign guestbooks.
                </p>
              </div>
            </div>

            {/* Row 3 */}

            {/* Card E: Planning & Calendar (Wide) */}
            <div className="col-span-1 md:col-span-6 group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">Planning & Calendar</h3>
                  <p className="text-muted-foreground">
                    Plan your next watch or read. Set reminders for releases and trips.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <div className="mt-32 mb-20 text-center px-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-forwards">
          <span className="text-emerald-500 font-medium">Support the Journey</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Enjoying Storyline?</h2>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10">
          Storyline is a passion project built to help you track your life's greatest moments.
          If you find it useful, consider buying me a coffee!
        </p>
        <a
          href="https://buymeacoffee.com/notvikke"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 group"
        >
          <span className="absolute inset-0 w-full h-full bg-emerald-500/50 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-200 animate-pulse"></span>
          <span className="relative flex items-center gap-3">
            Buy me a Coffee ☕
          </span>
        </a>
      </div>

      {/* Footer */}
      <Footer />

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
