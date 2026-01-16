import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Storyline",
    default: "Storyline - Your Personal Memory Tracker",
  },
  description: "A premium personal tracker & memory log for movies, books, travel experiences, and personal stories.",
  openGraph: {
    title: "Storyline",
    description: "Track your life's best moments.",
    url: "https://storyline.app",
    siteName: "Storyline",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00FFCC",
          colorBackground: "#050505",
          colorText: "#FFFFFF",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl",
          formButtonPrimary:
            "bg-[#00FFCC] text-black hover:bg-[#00e6b8] shadow-[0_0_15px_rgba(0,255,204,0.3)] transition-all uppercase tracking-widest text-xs font-bold",
          socialButtonsBlockButton:
            "bg-white/5 border border-white/10 hover:bg-white/10",
          footerActionLink: "text-[#00FFCC] hover:text-[#FF7EB6]",
          userButtonPopoverFooter: "hidden",
          devButton: "hidden",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`font-sans antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
