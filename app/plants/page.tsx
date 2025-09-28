"use client";

import { LayoutWrapper } from "@/components/layout-wrapper";
import { PlantGrid } from "@/components/plant-grid";
import { FadeIn } from "@/components/animations";
import { FiFilter, FiSearch } from "react-icons/fi";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PlantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-8">
            <h1 className="text-3xl font-bold text-center">Our Plants</h1>
            <p className="text-muted-foreground text-center">
              Explore all the plants in our gardening club
            </p>
          </FadeIn>

          <FadeIn className="mb-8" delay={0.1}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <FiSearch className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search plants..."
                  className="input w-full pl-10"
                  style={{ paddingLeft: '2.5rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`btn-outline flex items-center gap-2 w-full sm:w-auto ${isFilterOpen ? 'bg-accent text-accent-foreground' : ''}`}
                onClick={handleFilterToggle}
              >
                <FiFilter className="h-4 w-4" />
                Filter
              </motion.button>
            </div>

            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 border rounded-md bg-card"
              >
                <h3 className="font-medium mb-3">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {["all", "indoor", "outdoor", "flowering", "foliage"].map((category) => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filterCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </FadeIn>

          <PlantGrid searchTerm={searchTerm} categoryFilter={filterCategory} />
        </div>
      </div>
    </LayoutWrapper>
  );
}