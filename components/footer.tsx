"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FeedbackModal } from "@/components/feedback-modal";

export const Footer = () => {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackTab, setFeedbackTab] = useState<"bug" | "feature">("bug");

    const openFeedback = (tab: "bug" | "feature") => {
        setFeedbackTab(tab);
        setIsFeedbackOpen(true);
    };

    return (
        <footer className="py-8 mt-12 text-center border-t border-border bg-card/30">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground/80 mb-6 px-4">
                <a
                    href="https://buymeacoffee.com/notvikke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors cursor-pointer"
                >
                    Donate
                </a>
                <span className="text-border">•</span>
                <button
                    onClick={() => openFeedback("bug")}
                    className="hover:text-primary transition-colors cursor-pointer"
                >
                    Report Bug
                </button>
                <span className="text-border">•</span>
                <button
                    onClick={() => openFeedback("feature")}
                    className="hover:text-primary transition-colors cursor-pointer"
                >
                    Request Feature
                </button>
            </div>

            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
                Created with love by{" "}
                <a
                    href="https://notvikke.github.io/portfolio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                >
                    Vignesh
                </a>
                <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                    <Heart size={14} className="fill-red-500 text-red-500" />
                </motion.span>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
                © {new Date().getFullYear()} Storyline. All your stories, one place.
            </p>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onOpenChange={setIsFeedbackOpen}
                defaultTab={feedbackTab}
            />
        </footer>
    );
};
