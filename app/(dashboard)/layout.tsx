import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { MobileHeader } from "@/components/mobile-header";
import { PageTransition } from "@/components/page-transition";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Header */}
            <MobileHeader />

            {/* Main Content */}
            <main className="flex-1 w-full md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
                <PageTransition>{children}</PageTransition>
                <Footer />
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav />
        </div>
    );
}
