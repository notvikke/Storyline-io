import { Sidebar } from "@/components/sidebar";
import { PageTransition } from "@/components/page-transition";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    );
}
