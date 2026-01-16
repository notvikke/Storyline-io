import { UserButton } from "@clerk/nextjs";
import { DashboardLogo } from "./dashboard-logo";

export const MobileHeader = () => {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl md:hidden">
            <div className="container flex h-16 items-center justify-between px-4">
                <DashboardLogo />
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "w-8 h-8 border-2 border-primary/20"
                        }
                    }}
                />
            </div>
        </header>
    );
};
