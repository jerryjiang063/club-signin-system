"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiSearch } from "react-icons/fi";
import { GiPlantRoots } from "react-icons/gi";
import { motion } from "framer-motion";

interface Plant {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PlantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    const fetchPlants = async () => {
      try {
        const response = await fetch("/api/plants");
        if (!response.ok) {
          throw new Error("Failed to fetch plants");
        }
        const data = await response.json();
        setPlants(data.plants);
      } catch (err) {
        setError("An error occurred while fetching plants");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPlants();
    }
  }, [status, session, router]);

  const handleDeletePlant = async (id: string) => {
    if (confirm("Are you sure you want to delete this plant?")) {
      try {
        const response = await fetch(`/api/plants/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete plant");
        }

        setPlants(plants.filter((plant) => plant.id !== id));
      } catch (err) {
        setError("An error occurred while deleting the plant");
        console.error(err);
      }
    }
  };

  const filteredPlants = plants.filter((plant) =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plant.description && plant.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <GiPlantRoots className="mx-auto h-12 w-12 animate-pulse text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-xl font-semibold">Error</h2>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary mt-4"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center sm:text-left"
          >
            <h1 className="text-3xl font-bold">Plants Management</h1>
            <p className="text-muted-foreground">
              Add, edit, and manage plants in the club
            </p>
          </motion.div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <FiSearch className="h-4 w-4" />
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
            <Link href="/admin/plants/new" className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <FiPlus className="h-4 w-4" />
              Add New Plant
            </Link>
          </div>

          {filteredPlants.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card mx-auto max-w-md"
            >
              <div className="card-content text-center py-12">
                <GiPlantRoots className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No plants found</h3>
                <p className="mt-2 text-muted-foreground">
                  {searchTerm
                    ? "No plants match your search criteria"
                    : "Start by adding a new plant to the club"}
                </p>
                {!searchTerm && (
                  <Link href="/admin/plants/new" className="btn-primary mt-4 inline-flex">
                    Add New Plant
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredPlants.map((plant) => (
                <motion.div 
                  key={plant.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card overflow-hidden"
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
                      <p className="card-description line-clamp-2">
                        {plant.description}
                      </p>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="flex w-full items-center justify-between">
                      <Link
                        href={`/admin/plants/${plant.id}/edit`}
                        className="btn-outline flex items-center gap-2"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePlant(plant.id)}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}