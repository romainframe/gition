import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ConfigProvider } from "@/components/config-provider";
import { InspectTooltip } from "@/components/dev/inspect-tooltip";
import { FileWatcherProvider } from "@/components/file-watcher-provider";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { InspectProvider } from "@/contexts/inspect-context";
import { LanguageProvider } from "@/contexts/language-context";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gition - Documentation & Task Management",
  description:
    "Zero-config local web interface for Markdown/MDX files with Kanban-style task boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <InspectProvider>
                <FileWatcherProvider>
                  <div className="flex min-h-screen flex-col">
                    <Header />
                    <div className="flex flex-1 relative">
                      <div className="fixed left-0 top-16 bottom-0 z-10">
                        <Sidebar />
                      </div>
                      <main className="flex-1 ml-72 overflow-auto no-scrollbar">
                        <div className="mx-auto max-w-screen-xl p-6 lg:p-8">
                          {children}
                        </div>
                      </main>
                    </div>
                    <InspectTooltip />
                  </div>
                </FileWatcherProvider>
              </InspectProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
