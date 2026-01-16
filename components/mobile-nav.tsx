"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, BookOpen, MapPin, Calendar, FileText } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/books", label: "Books", icon: BookOpen },
    { href: "/calendar", label: "Date", icon: Calendar },
    { href: "/travel", label: "Travel", icon: MapPin },
    { href: "/blog", label: "Blog", icon: FileText },
];

export const MobileNav = () => {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border md:hidden safe-area-bottom">
            <nav className="flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${isActive ? "text-[#00FFCC] drop-shadow-[0_0_8px_rgba(0,255,204,0.3)]" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon size={22} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
