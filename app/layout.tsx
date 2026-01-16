import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`font-sans antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
