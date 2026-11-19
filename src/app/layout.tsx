import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { AppProviders } from "@/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Panel Surya",
  description: "Estimasi dan prediksi keluaran daya panel surya jangka pendek",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex h-full min-h-screen bg-background text-foreground"
        suppressHydrationWarning
      >
        <AppProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
                <div className="flex items-center gap-2 md:hidden">
                  <MobileNav />
                  <span className="text-base font-semibold">Solar Hub</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto p-4 sm:p-6">
                <Suspense fallback={null}>{children}</Suspense>
              </main>
              <Toaster />
            </div>
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
