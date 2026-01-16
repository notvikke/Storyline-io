import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
                <MapPinOff size={64} className="text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
                Looks like you've wandered off the map. This page doesn't exist in your story.
            </p>
            <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-all"
            >
                <ArrowLeft size={18} />
                Return Home
            </Link>
        </div>
    );
}
