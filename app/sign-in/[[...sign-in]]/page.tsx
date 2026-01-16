import { SignIn } from "@clerk/nextjs";
import { CoralineStsoneLogo } from "@/components/ui/coraline-stone-logo";

export default function SignInPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00FFCC]/5 via-[#050505] to-[#050505]" />

            {/* Logo Section */}
            <div className="relative z-10 flex flex-col items-center gap-6 mb-8">
                <CoralineStsoneLogo size={64} />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Welcome Back
                </h1>
            </div>

            {/* Clerk Component */}
            <div className="relative z-10">
                <SignIn />
            </div>
        </div>
    );
}
