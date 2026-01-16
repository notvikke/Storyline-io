"use client";

import { useEffect } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="rounded-full bg-red-500/10 p-6 mb-6">
                <AlertTriangle size={64} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                We encountered an unexpected error. Please try again.
            </p>
            <button
                onClick={reset}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-all"
            >
                <RotateCcw size={18} />
                Try again
            </button>
        </div>
    );
}
