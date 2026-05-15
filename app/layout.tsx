import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatBot } from "@/components/AIChatBot";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HireHub - Where Ambition Meets Opportunity",
  description: "Join the premium network of top-tier talent and innovative companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <AIChatBot />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
