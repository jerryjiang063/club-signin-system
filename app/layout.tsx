import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

// 使用本地字体文件 - Geist Sans
const geistSans = localFont({
  src: [
    {
      path: '../public/fonts/Geist-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-geist-sans",
});

// 使用本地字体文件 - Geist Mono
const geistMono = localFont({
  src: [
    {
      path: '../public/fonts/GeistMono-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeistMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeistMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeistMono-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeistMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-geist-mono",
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