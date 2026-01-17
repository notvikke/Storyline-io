"use client";

import { Mail, Globe, Instagram, Twitter } from "lucide-react";

interface SocialLink {
    platform: string;
    url: string;
    icon: React.ReactNode;
    hoverColor: string;
    hoverBorder: string;
}

interface SocialLinkRowProps {
    social_x?: string | null;
    social_instagram?: string | null;
    social_tiktok?: string | null;
    social_snapchat?: string | null;
    social_spotify?: string | null;
    social_email?: string | null;
    social_website?: string | null;
}

export function SocialLinkRow({
    social_x,
    social_instagram,
    social_tiktok,
    social_snapchat,
    social_spotify,
    social_email,
    social_website
}: SocialLinkRowProps) {
    const links: SocialLink[] = [];

    // TikTok SVG Icon
    const TikTokIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
    );

    // Snapchat SVG Icon
    const SnapchatIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.11.479-.11.301 0 .564.13.707.43.13.285.107.675-.12.975-.15.181-.553.478-1.316.77-.766.292-1.032.343-1.167.424-.27.165-.33.42-.359.62-.06.42-.061.69-.076 1.05-.029.18-.074.36-.134.54-.53 1.56-1.706 2.64-3.301 3.03-.164.045-.299.12-.434.21-.104.12-.209.27-.284.42-.12.3-.06.644.076.93.195.434.55.764 1.02 1.034.24.12.556.27.944.434.39.165.838.36 1.258.58.3.149.644.346.898.599.48.49.585 1.124.569 1.574-.016.36-.12.674-.345.898-.434.419-1.03.614-2.204.794-.48.074-.914.27-1.123.495-.211.224-.316.48-.316.74 0 .135.03.27.09.404.034.06.039.074.039.076.464.9.63 1.34.63 1.56 0 .27-.135.465-.239.57-.195.15-.45.224-.749.224-.18 0-.387-.03-.584-.074-.451-.102-.899-.24-1.347-.387-.42-.135-.869-.284-1.363-.284h-.06c-.494 0-.943.15-1.363.284-.448.149-.896.284-1.347.387-.197.045-.403.074-.584.074-.3 0-.554-.074-.749-.224-.105-.105-.24-.3-.24-.57 0-.221.166-.661.63-1.56 0-.002.005-.016.04-.076.06-.134.09-.269.09-.404 0-.26-.105-.516-.316-.74-.21-.224-.643-.42-1.123-.495-1.174-.18-1.77-.375-2.204-.794-.225-.224-.33-.538-.345-.898-.015-.45.09-1.084.57-1.574.253-.253.598-.45.898-.599.42-.22.868-.415 1.258-.58.388-.164.704-.314.944-.434.47-.27.825-.6 1.02-1.034.136-.286.196-.63.076-.93-.075-.15-.18-.3-.284-.42-.135-.09-.27-.165-.434-.21-1.595-.39-2.771-1.47-3.301-3.03-.06-.18-.105-.36-.134-.54-.015-.36-.016-.63-.076-1.05-.029-.2-.089-.455-.359-.62-.135-.081-.401-.132-1.167-.424-.763-.292-1.166-.589-1.316-.77-.227-.3-.25-.69-.12-.975.143-.3.406-.43.707-.43.135 0 .314.022.479.11.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847 1.583-3.545 4.94-3.821 5.93-3.821z" />
        </svg>
    );

    if (social_instagram) {
        links.push({
            platform: "Instagram",
            url: social_instagram.startsWith('http') ? social_instagram : `https://instagram.com/${social_instagram}`,
            icon: <Instagram className="w-5 h-5" />,
            hoverColor: "hover:text-pink-500",
            hoverBorder: "hover:border-pink-500"
        });
    }

    if (social_x) {
        links.push({
            platform: "X",
            url: social_x.startsWith('http') ? social_x : `https://x.com/${social_x}`,
            icon: <Twitter className="w-5 h-5" />,
            hoverColor: "hover:text-white",
            hoverBorder: "hover:border-white"
        });
    }

    if (social_tiktok) {
        links.push({
            platform: "TikTok",
            url: social_tiktok.startsWith('http') ? social_tiktok : `https://tiktok.com/@${social_tiktok}`,
            icon: <TikTokIcon />,
            hoverColor: "hover:text-[#ff0050]",
            hoverBorder: "hover:border-[#ff0050]"
        });
    }

    if (social_snapchat) {
        links.push({
            platform: "Snapchat",
            url: social_snapchat.startsWith('http') ? social_snapchat : `https://snapchat.com/add/${social_snapchat}`,
            icon: <SnapchatIcon />,
            hoverColor: "hover:text-yellow-400",
            hoverBorder: "hover:border-yellow-400"
        });
    }

    if (social_spotify) {
        links.push({
            platform: "Spotify",
            url: social_spotify.startsWith('http') ? social_spotify : `https://open.spotify.com/user/${social_spotify}`,
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
            ),
            hoverColor: "hover:text-green-500",
            hoverBorder: "hover:border-green-500"
        });
    }

    if (social_email) {
        links.push({
            platform: "Email",
            url: `mailto:${social_email}`,
            icon: <Mail className="w-5 h-5" />,
            hoverColor: "hover:text-[#00FFCC]",
            hoverBorder: "hover:border-[#00FFCC]"
        });
    }

    if (social_website) {
        links.push({
            platform: "Website",
            url: social_website.startsWith('http') ? social_website : `https://${social_website}`,
            icon: <Globe className="w-5 h-5" />,
            hoverColor: "hover:text-sky-400",
            hoverBorder: "hover:border-sky-400"
        });
    }

    if (links.length === 0) return null;

    return (
        <div className="flex items-center gap-2 md:gap-3">
            {links.map((link) => (
                <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                        w-10 h-10 rounded-full 
                        flex items-center justify-center
                        border border-white/10 
                        text-gray-400
                        transition-all duration-200
                        hover:scale-110
                        ${link.hoverColor}
                        ${link.hoverBorder}
                    `}
                    title={link.platform}
                >
                    {link.icon}
                </a>
            ))}
        </div>
    );
}
