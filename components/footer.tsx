"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
    return (
        <footer className="py-6 mt-12 text-center border-t border-border">
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
                Created with love by Vignesh
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
        </footer>
    );
};
