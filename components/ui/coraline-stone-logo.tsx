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
            <path
                d="M 50 80 L 15 30 L 85 30 Z"
                fill="none"
                stroke="#00FFCC"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Circular Hole in Center */}
            <circle
                cx="50"
                cy="50"
                r="12"
                fill="#050505"
                stroke="#00FFCC"
                strokeWidth="3"
            />
        </svg>
    );
};
