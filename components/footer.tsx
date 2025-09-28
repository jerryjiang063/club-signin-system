import Link from "next/link";
import { GiPlantRoots } from "react-icons/gi";
import { useEffect, useState } from "react";

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled to the bottom
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Show footer when near bottom (within 100px of bottom)
      const isBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsVisible(isBottom);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer 
      className={`border-t bg-background transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="container mx-auto py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <GiPlantRoots className="h-6 w-6 text-primary" />
              <span className="font-bold">In-Class Gardening Club</span>
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              Nurturing plants and growing knowledge together.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 md:items-end">
            <div className="flex gap-4">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy
              </Link>
            </div>
            <p className="text-center text-sm text-muted-foreground md:text-right">
              &copy; {new Date().getFullYear()} By Jerry Jiang. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}