"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import Link from "next/link";
import Image from "next/image";
import { FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi";
import { GiPlantRoots } from "react-icons/gi";
import { motion } from "framer-motion";
import { SessionWrapper } from "@/components/session-wrapper";

interface PlantCare {
  id: string;
  plantId: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  plant: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
}

interface CheckIn {
  id: string;
  plantId: string;
  userId: string;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  plant: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plantCare, setPlantCare] = useState<PlantCare[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          console.log("Fetching plant care data...");
          // Fetch plant care assignments
          const careResponse = await fetch("/api/plant-care", {
            headers: {
              "Content-Type": "application/json",
              // Add auth header if needed
            }
          });
          
          console.log("Plant care response status:", careResponse.status);
          
          if (!careResponse.ok) {
            const errorData = await careResponse.json().catch(() => ({}));
            console.error("Plant care error data:", errorData);
            throw new Error(`Failed to fetch plant care data: ${careResponse.status} ${errorData.error || ""}`);
          }
          
          const careData = await careResponse.json();
          console.log("Plant care data:", careData);
          setPlantCare(careData.plantCare || []);
          setDebugInfo(prev => ({ ...prev, plantCare: careData }));

          // Fetch recent check-ins
          const checkInsResponse = await fetch("/api/check-in");
          if (!checkInsResponse.ok) {
            const errorData = await checkInsResponse.json().catch(() => ({}));
            console.error("Check-ins error data:", errorData);
            throw new Error(`Failed to fetch check-ins data: ${checkInsResponse.status}`);
          }
          
          const checkInsData = await checkInsResponse.json();
          console.log("Check-ins data:", checkInsData);
          setDebugInfo(prev => ({ ...prev, checkIns: checkInsData }));
          
          // Filter check-ins for current user
          const userCheckIns = checkInsData.checkIns?.filter(
            (checkIn: CheckIn) => checkIn.userId === session.user.id
          ) || [];
          setRecentCheckIns(userCheckIns.slice(0, 5)); // Get 5 most recent
        } catch (err: any) {
          console.error("Error fetching dashboard data:", err);
          setError(err.message || "An error occurred while fetching data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status, session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-12">
        <Loading text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay
          message={error}
          onRetry={() => window.location.reload()}
        />
        {debugInfo && (
          <div className="mt-8 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-[300px]">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}
        </p>
      </FadeIn>

      {/* Plants assigned to user */}
      <div className="mb-12">
        <FadeIn className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Plants</h2>
        </FadeIn>

        {plantCare.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="card">
              <div className="card-content text-center py-12">
                <div className="mx-auto">
                  <GiPlantRoots className="h-12 w-12 text-muted-foreground opacity-50 mx-auto" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No plants assigned yet</h3>
                <p className="mt-2 text-muted-foreground">
                  You don&apos;t have any plants assigned to you at the moment.
                </p>
              </div>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plantCare.map((care) => (
              <StaggerItem key={care.id}>
                <div className="card overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 w-full">
                    {care.plant.imageUrl ? (
                      <Image
                        src={care.plant.imageUrl}
                        alt={care.plant.name}
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
                    <h3 className="card-title">{care.plant.name}</h3>
                    {care.plant.description && (
                      <p className="card-description">{care.plant.description}</p>
                    )}
                  </div>
                  <div className="card-content flex-1">
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FiCalendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Assigned: {formatDate(care.startDate)}
                        </span>
                      </div>
                      {care.endDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiClock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Until: {formatDate(care.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href={`/check-in/${care.plantId}`}
                        className="btn-primary w-full"
                      >
                        Check In
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Recent check-ins */}
      <div>
        <FadeIn className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Check-ins</h2>
        </FadeIn>

        {recentCheckIns.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="card">
              <div className="card-content text-center py-12">
                <FiCheckCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No check-ins yet</h3>
                <p className="mt-2 text-muted-foreground">
                  You haven&apos;t checked in any plants yet.
                </p>
              </div>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-4">
            {recentCheckIns.map((checkIn) => (
              <StaggerItem key={checkIn.id}>
                <div className="card">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-48 w-full md:h-auto md:w-48">
                      {checkIn.imageUrl ? (
                        <Image
                          src={checkIn.imageUrl}
                          alt={`Check-in for ${checkIn.plant.name}`}
                          fill
                          className="object-cover"
                        />
                      ) : checkIn.plant.imageUrl ? (
                        <Image
                          src={checkIn.plant.imageUrl}
                          alt={checkIn.plant.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <GiPlantRoots className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{checkIn.plant.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(checkIn.createdAt)}
                        </span>
                      </div>
                      {checkIn.notes && (
                        <p className="mt-2 text-muted-foreground">{checkIn.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <DashboardContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}