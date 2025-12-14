"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { FiHome, FiCalendar, FiUser, FiSettings, FiLogOut, FiClock } from "react-icons/fi";
import { GiPlantRoots } from "react-icons/gi";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { NotificationIcon } from "@/components/notification-icon";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <FiHome className="h-5 w-5" />,
      showAlways: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <FiCalendar className="h-5 w-5" />,
      showAlways: false,
    },
    {
      href: "/plants",
      label: "Plants",
      icon: <GiPlantRoots className="h-5 w-5" />,
      showAlways: true,
    },
    {
      href: "/activity",
      label: "Recent Activity",
      icon: <FiClock className="h-5 w-5" />,
      showAlways: true,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <FiUser className="h-5 w-5" />,
      showAlways: false,
    },
    {
      href: "/admin",
      label: "Admin",
      icon: <FiSettings className="h-5 w-5" />,
      showOnlyForAdmin: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <GiPlantRoots className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              In-Class Gardening Club
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              if (
                (item.showAlways || session) &&
                (!item.showOnlyForAdmin || session?.user?.role === "ADMIN")
              ) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-foreground/60"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              }
              return null;
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-4">
              {session.user?.role === "ADMIN" && (
                <NotificationIcon count={2} />
              )}
              <span className="hidden text-sm font-medium md:block">
                {session.user?.name}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-full bg-secondary p-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                aria-label="Sign out"
                disabled={isSigningOut}
              >
                <FiLogOut className="h-4 w-4" />
                <span className="hidden md:block">{isSigningOut ? "Signing out..." : "Sign out"}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-primary"
            >
              Sign in
            </Link>
          )}
          <button
            className="flex items-center justify-center rounded-md p-2 text-foreground/60 transition-colors hover:text-primary md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${mobileMenuOpen ? "hidden" : "block"}`}
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${mobileMenuOpen ? "block" : "hidden"}`}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="container pb-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              if (
                (item.showAlways || session) &&
                (!item.showOnlyForAdmin || session?.user?.role === "ADMIN")
              ) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-foreground/60"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              }
              return null;
            })}
          </nav>
        </div>
      )}
    </header>
  );
}