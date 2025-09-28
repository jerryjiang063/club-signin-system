"use client";

import { useState, useEffect } from "react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiCalendar, FiUser, FiClock, FiDroplet, FiInfo } from "react-icons/fi";
import { GiPlantRoots, GiWateringCan } from "react-icons/gi";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface Plant {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  waterAmount: string | null;
  waterSchedule: string | null;
  careNotes: string | null;
  checkIns: CheckIn[];
}

interface CheckIn {
  id: string;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PlantDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlant = async () => {
      if (!id) return;
      
      try {
        console.log("Fetching plant with ID:", id);
        const response = await fetch(`/api/plants/${id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch plant data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Plant data:", data);
        setPlant(data.plant);
      } catch (err: any) {
        setError(`An error occurred while fetching plant data: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-12">
          <Loading text="Loading plant details..." />
        </div>
      </LayoutWrapper>
    );
  }

  if (error || !plant) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-12">
          <ErrorDisplay
            message={error || "Plant not found"}
            onRetry={() => window.location.reload()}
          />
          <div className="flex justify-center mt-6">
            <Link href="/plants" className="btn-primary">
              Back to Plants
            </Link>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/plants"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <FiArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{plant.name}</h1>
            <p className="text-muted-foreground">Plant Details</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Plant Image and Details */}
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="relative h-64 w-full md:h-80">
                {plant.imageUrl ? (
                  <Image
                    src={plant.imageUrl}
                    alt={plant.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <GiPlantRoots className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="card-header">
                <h2 className="card-title">{plant.name}</h2>
                {plant.description && (
                  <p className="mt-2 text-muted-foreground">{plant.description}</p>
                )}
              </div>
            </div>

            {/* Care Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <GiWateringCan className="h-5 w-5 text-primary" />
                  Care Information
                </h2>
              </div>
              <div className="card-content space-y-4">
                {plant.waterAmount && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiDroplet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Water Amount</p>
                      <p className="font-medium">{plant.waterAmount}</p>
                    </div>
                  </div>
                )}
                
                {plant.waterSchedule && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiCalendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Watering Schedule</p>
                      <p className="font-medium">{plant.waterSchedule}</p>
                    </div>
                  </div>
                )}
                
                {plant.careNotes && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiInfo className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Care Notes</p>
                      <p className="font-medium">{plant.careNotes}</p>
                    </div>
                  </div>
                )}

                {!plant.waterAmount && !plant.waterSchedule && !plant.careNotes && (
                  <p className="text-muted-foreground text-center py-2">
                    No care information available for this plant.
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Check-ins */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Recent Check-ins</h2>
            {plant.checkIns.length === 0 ? (
              <div className="card">
                <div className="card-content text-center py-8">
                  <FiCalendar className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No check-ins yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    This plant hasn&apos;t been checked in yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {plant.checkIns.map((checkIn) => (
                  <motion.div 
                    key={checkIn.id} 
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiUser className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{checkIn.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FiClock className="h-4 w-4" />
                          <span>{formatDate(checkIn.createdAt)}</span>
                        </div>
                      </div>
                      {checkIn.notes && (
                        <p className="mb-4 text-muted-foreground">{checkIn.notes}</p>
                      )}
                      {checkIn.imageUrl && (
                        <div className="relative h-48 w-full overflow-hidden rounded-md">
                          <Image
                            src={checkIn.imageUrl}
                            alt={`Check-in by ${checkIn.user.name}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}