"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CoralineStsoneLogo } from "./ui/coraline-stone-logo";
import { AnimatePresence, motion } from "framer-motion";

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

interface DashboardLogoProps {
    showText?: boolean;
    className?: string;
}

export const DashboardLogo = ({ showText = true, className = "" }: DashboardLogoProps) => {
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
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer p-4"
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
                            className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#00FFCC] text-center drop-shadow-[0_0_15px_rgba(0,255,204,0.5)] select-none max-w-4xl"
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
            <Link
                href="/dashboard"
                onClick={handleLogoClick}
                className={`flex items-center gap-3 group ${className}`}
            >
                <CoralineStsoneLogo size={36} />
                {showText && (
                    <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Storyline
                    </span>
                )}
            </Link>
            <GreetingOverlay />
        </>
    );
};
