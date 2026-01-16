"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { CoralineStsoneLogo } from "./ui/coraline-stone-logo";
import {
    Home,
    Film,
    BookOpen,
    MapPin,
    Calendar,
    FileText,
    LogOut,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/books", label: "Books", icon: BookOpen },
    { href: "/travel", label: "Travel", icon: MapPin },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/blog", label: "Blog", icon: FileText },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border backdrop-blur-xl bg-opacity-80 flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-sidebar-border">
                <Link href="/dashboard" className="flex items-center gap-3 group">
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
            <div className="p-4 border-t border-sidebar-border space-y-2">
                <div className="flex items-center gap-3 px-4 py-3">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-10 h-10",
                            },
                        }}
                    />
                    <span className="text-sm text-muted-foreground">Your Account</span>
                </div>

                <SignOutButton redirectUrl="/">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group">
                        <LogOut size={20} className="group-hover:text-destructive" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
};
