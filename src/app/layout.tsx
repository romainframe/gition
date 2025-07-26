import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ConfigProvider } from "@/components/config-provider";
import { FileWatcherProvider } from "@/components/file-watcher-provider";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
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
              <FileWatcherProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 overflow-auto no-scrollbar">
                      <div className="mx-auto max-w-screen-xl p-6 lg:p-8">
                        {children}
                      </div>
                    </main>
                  </div>
                </div>
              </FileWatcherProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
