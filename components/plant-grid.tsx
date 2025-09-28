"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { GiPlantRoots } from "react-icons/gi";
import { motion } from "framer-motion";

interface Plant {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  waterAmount?: string | null;
  waterSchedule?: string | null;
  careNotes?: string | null;
}

interface PlantGridProps {
  searchTerm?: string;
  categoryFilter?: string;
}

export function PlantGrid({ searchTerm = "", categoryFilter = "all" }: PlantGridProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        console.log("Fetching plants...");
        const response = await fetch("/api/plants", {
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        
        console.log("Plants API response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Plants API error:", errorText);
          throw new Error(`Failed to fetch plants: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.plants?.length || 0} plants`);
        setPlants(data.plants || []);
      } catch (err: any) {
        setError(`An error occurred while fetching plants: ${err.message}`);
        console.error("Error fetching plants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading text="Loading plants..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <ErrorDisplay
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // 过滤植物
  let filteredPlants = plants;
  
  // 按搜索词过滤
  if (searchTerm) {
    filteredPlants = filteredPlants.filter(
      (plant) =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.description &&
          plant.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  // 按类别过滤（这里只是示例，实际应该根据植物的类别字段来过滤）
  if (categoryFilter && categoryFilter !== "all") {
    // 这里假设描述中包含类别关键词
    filteredPlants = filteredPlants.filter((plant) => 
      plant.description?.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }

  if (filteredPlants.length === 0) {
    return (
      <div className="card mx-auto max-w-md">
        <div className="card-content text-center py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <GiPlantRoots className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg font-medium"
          >
            {searchTerm ? "No plants found matching your search" : "No plants yet"}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-muted-foreground"
          >
            {searchTerm
              ? "Try a different search term or filter"
              : "There are no plants in the club yet."}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto">
      {filteredPlants.map((plant) => (
        <StaggerItem key={plant.id}>
          <Link
            href={`/plants/${plant.id}`}
            className="card overflow-hidden transition-transform hover:scale-[1.02]"
          >
            <div className="relative h-48 w-full">
              {plant.imageUrl ? (
                <Image
                  src={plant.imageUrl}
                  alt={plant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <GiPlantRoots className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="card-header">
              <h3 className="card-title">{plant.name}</h3>
              {plant.description && (
                <p className="card-description line-clamp-2">{plant.description}</p>
              )}
              {plant.waterSchedule && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Watering: </span>
                  {plant.waterSchedule}
                </p>
              )}
            </div>
          </Link>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}