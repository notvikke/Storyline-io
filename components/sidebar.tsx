"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { CoralineStsoneLogo } from "./ui/coraline-stone-logo";
import { AnimatePresence, motion } from "framer-motion";
import {
    Home,
    Film,
    BookOpen,
    MapPin,
    Calendar,
    FileText,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/books", label: "Books", icon: BookOpen },
    { href: "/travel", label: "Travel", icon: MapPin },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/blog", label: "Blog", icon: FileText },
];

const GREETING_MESSAGES = [
    "Have a beautiful day, {name}! ✨",
    "You’re looking absolutely radiant today, {name}.",
    "{name}, did you know you have the best taste in movies?",
    "Sending a giant hug your way, {name}! 🤗",
    "{name}, you're the main character of this storyline.",
    "Take a break and stay hydrated, {name}! 💧",
    "Storyline thinks you're doing a great job, {name}.",
    "Keep writing your story, {name}! ✍️",
    "You make this dashboard look good, {name}.",
    "Hey {name}, you're pretty awesome.",
    "Don't forget to smile today, {name}! 😊",
    "Your journey is inspiring, {name}.",
    "{name}, ready for the next chapter?",
    "The world is lucky to have you, {name}. 🌍",
    "Keep shining, {name}! ✨"
];

export const Sidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const [showGreeting, setShowGreeting] = useState(false);
    const [greetingMessage, setGreetingMessage] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogoClick = (e: React.MouseEvent) => {
        if (pathname === "/dashboard") {
            e.preventDefault();
            const name = user?.firstName || "there";
            const randomMsg = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
            setGreetingMessage(randomMsg.replace("{name}", name));
            setShowGreeting(true);

            // Hide after 3 seconds
            setTimeout(() => {
                setShowGreeting(false);
            }, 3000);
        }
    };

    const GreetingOverlay = () => {
        if (!mounted) return null;

        return createPortal(
            <AnimatePresence>
                {showGreeting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-0 left-64 right-0 bottom-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer"
                        onClick={() => setShowGreeting(false)}
                    >
                        <motion.h1
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                transition: { type: "spring", bounce: 0.5 }
                            }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="text-4xl md:text-6xl font-bold text-[#00FFCC] text-center px-8 drop-shadow-[0_0_15px_rgba(0,255,204,0.5)] select-none"
                        >
                            {greetingMessage}
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        );
    };

    return (
        <>
            <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border backdrop-blur-xl bg-opacity-80 flex flex-col z-40">
                {/* Logo Section */}
                <div className="p-6 border-b border-sidebar-border">
                    <Link
                        href="/dashboard"
                        onClick={handleLogoClick}
                        className="flex items-center gap-3 group"
                    >
                        <CoralineStsoneLogo size={36} />
                        <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            Storyline
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-primary/20"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                    }
                  `}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/30 transition-colors">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 border-2 border-primary/20",
                                },
                            }}
                        />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold truncate text-foreground">
                                {user?.fullName || user?.username || "Storyline User"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {user?.primaryEmailAddress?.emailAddress}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
            <GreetingOverlay />
        </>
    );
};
