import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "./providers";
import { LazyAIChatBot } from "@/components/LazyAIChatBot";

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
          <LazyAIChatBot />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
