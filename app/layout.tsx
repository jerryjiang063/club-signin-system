import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "In-Class Gardening Club",
  description: "A platform for gardening club members to check in and care for plants",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ]
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let isDark = false;
                
                // 首先检查 localStorage
                if (typeof localStorage !== 'undefined') {
                  if (localStorage.getItem('theme') === 'dark') {
                    isDark = true;
                  } else if (localStorage.getItem('theme') === 'light') {
                    isDark = false;
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    // 如果没有 localStorage 设置，则检查系统偏好
                    isDark = true;
                  }
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  // 如果没有 localStorage，则检查系统偏好
                  isDark = true;
                }
                
                // 应用主题
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}