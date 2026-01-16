"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { DashboardLogo } from "./dashboard-logo";
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

export const Sidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border backdrop-blur-xl bg-opacity-80 flex flex-col z-40 hidden md:flex">
            {/* Logo Section */}
            <div className="p-6 border-b border-sidebar-border">
                <DashboardLogo />
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
    );
};
