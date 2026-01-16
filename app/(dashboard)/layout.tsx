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

                <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t border-border">
                    <p>
                        Created with love by{" "}
                        <a
                            href="https://notvikke.github.io/portfolio/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                        >
                            Vignesh
                        </a>
                    </p>
                </footer>
            </main>
        </div>
    );
}
