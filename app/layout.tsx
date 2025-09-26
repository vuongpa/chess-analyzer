import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { fontSans, fontSerif, fontMono } from "./fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Analyzer - Analyze your chess games",
  description: "Upload and analyze your chess games with powerful analytical tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
