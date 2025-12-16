"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ReduxProvider } from "@/providers/redux-provider"
import { ThemeProvider, useTheme } from "next-themes"
import { Toaster } from "sonner";
import { registerNextThemeSetter, useThemeStore } from "@/stores/useThemeStore";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const { isDark, setTheme } = useThemeStore();
  const { accessToken } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  const { isDark, setTheme: setZustandTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    // Ưu tiên next-themes => sync vào Zustand
    if (theme) {
      setZustandTheme(theme === "dark");
    }
  }, [theme, setZustandTheme]);
  // Bridge: đăng ký setter của next-themes cho Zustand
  useEffect(() => {
    registerNextThemeSetter(setTheme);
  }, [setTheme]);
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // useEffect(() => {
  //   setTheme(isDark);
  // }, [isDark]);

  useEffect(() => {
    if (accessToken) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [accessToken, connectSocket, disconnectSocket]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            {children}
          <Toaster richColors />
          </ReduxProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  )
}
