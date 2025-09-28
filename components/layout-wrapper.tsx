"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SessionProvider } from "next-auth/react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
