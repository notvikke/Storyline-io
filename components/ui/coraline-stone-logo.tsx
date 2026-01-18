"use client";

import React from "react";

interface CoralineStoneLogoProps {
    className?: string;
    size?: number;
}

export const CoralineStsoneLogo: React.FC<CoralineStoneLogoProps> = ({
    className = "",
    size = 40,
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                filter: "drop-shadow(0 0 12px rgba(0, 255, 204, 0.6))",
            }}
        >
            {/* Inverted Equilateral Triangle */}
            {/* Filled Inverted Triangle with Hole (Compound Path) */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M50 90L10 20H90L50 90ZM50 50C53.3137 50 56 47.3137 56 44C56 40.6863 53.3137 38 50 38C46.6863 38 44 40.6863 44 44C44 47.3137 46.6863 50 50 50Z"
                fill="#00FFCC"
            />
        </svg>
    );
};
