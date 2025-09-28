"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import Link from "next/link";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FiArrowLeft, FiUpload, FiAlertCircle, FiCheckCircle, FiDroplet, FiCalendar, FiClock, FiFileText } from "react-icons/fi";
import { GiPlantRoots } from "react-icons/gi";
import { motion } from "framer-motion";

interface Plant {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  waterAmount: string | null;
  waterSchedule: string | null;
  careNotes: string | null;
}

interface PlantCare {
  id: string;
  plantId: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  taskType: string | null;
  notes: string | null;
}

function CheckInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const plantId = params?.plantId as string;
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [plantCare, setPlantCare] = useState<PlantCare | null>(null);
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          // Fetch plant details
          const plantResponse = await fetch(`/api/plants/${plantId}`);
          if (!plantResponse.ok) {
            throw new Error("Failed to fetch plant data");
          }
          const plantData = await plantResponse.json();
          setPlant(plantData.plant);

          // Fetch plant care assignment
          const careResponse = await fetch("/api/plant-care");
          if (!careResponse.ok) {
            throw new Error("Failed to fetch plant care assignments");
          }
          const careData = await careResponse.json();
          
          // Find the assignment for this plant and user
          const assignment = careData.plantCare.find(
            (care: PlantCare) => care.plantId === plantId && care.userId === session.user.id
          );
          
          setPlantCare(assignment || null);
        } catch (err: any) {
          setError(err.message || "An error occurred while fetching data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status, session, router, plantId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Upload image if available
      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "gardening_club");

        // In a real app, you would upload to your own server or a service like Cloudinary
        // For this example, we'll just simulate the image URL
        imageUrl = URL.createObjectURL(image);
      }

      // Create check-in
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plantId,
          notes,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create check-in");
      }

      setSuccess(true);
      setShowSuccessModal(true);
      
      // Reset form
      setNotes("");
      setImage(null);
      setImagePreview(null);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the check-in");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Loading text="Loading plant details..." />
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
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay 
          message="Plant not found"
          onRetry={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  if (!plantCare && session?.user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-12">
        <div className="card text-center p-8">
          <GiPlantRoots className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mt-4">Not Assigned</h2>
          <p className="text-muted-foreground mt-2">
            You are not currently assigned to care for this plant.
          </p>
          <Link href="/dashboard" className="btn-primary mt-6">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{plant.name}</h1>
          <p className="text-muted-foreground">
            Check in for your plant care task
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Plant Details */}
        <div className="card overflow-hidden">
          <div className="relative h-64 w-full">
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
              <p className="card-description">{plant.description}</p>
            )}
          </div>
          <div className="card-content">
            <div className="space-y-4">
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
              
              {plantCare && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiClock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assignment Period</p>
                    <p className="font-medium">
                      {formatDate(plantCare.startDate)} - {plantCare.endDate ? formatDate(plantCare.endDate) : "Ongoing"}
                    </p>
                  </div>
                </div>
              )}
              
              {(plant.careNotes || (plantCare && plantCare.notes)) && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiFileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Care Notes</p>
                    <p className="font-medium">{plant.careNotes || plantCare?.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Check-in Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Check In</h2>
            <p className="card-description">
              Record your plant care activity
            </p>
          </div>
          <div className="card-content">
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-200">
                <FiAlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium leading-none">
                  Notes
                </label>
                <textarea
                  id="notes"
                  className="input min-h-[120px] w-full"
                  placeholder="Describe what you did (e.g., watered the plant, pruned leaves, etc.)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Photo (Optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {imagePreview ? (
                    <div className="relative h-48 mx-auto">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FiUpload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop a photo here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (Max size: 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 h-12 text-lg"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Check In"}
                <FiCheckCircle className="h-5 w-5" />
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card max-w-md w-full mx-4 rounded-lg overflow-hidden shadow-xl"
          >
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Check-in Successful!</h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for taking care of the plant. Your check-in has been recorded.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/dashboard")}
                    className="btn-primary"
                  >
                    Back to Dashboard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSuccessModal(false)}
                    className="btn-outline"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function CheckInPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <CheckInContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}