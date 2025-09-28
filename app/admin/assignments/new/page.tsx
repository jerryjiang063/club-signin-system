"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Plant {
  id: string;
  name: string;
}

function NewAssignmentContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [userId, setUserId] = useState("");
  const [plantId, setPlantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskType, setTaskType] = useState("Watering");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch("/api/admin/users");
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);

        // Fetch plants
        const plantsResponse = await fetch("/api/plants");
        if (!plantsResponse.ok) {
          throw new Error("Failed to fetch plants");
        }
        const plantsData = await plantsResponse.json();
        setPlants(plantsData.plants || []);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/plant-care", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          plantId,
          startDate,
          endDate: endDate || null,
          taskType,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create assignment");
      }

      setSuccess(true);
      // Reset form
      setUserId("");
      setPlantId("");
      setStartDate("");
      setEndDate("");
      setTaskType("Watering");
      setNotes("");
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the assignment");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Loading text="Loading..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/assignments"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Plant Care Assignment</h1>
          <p className="text-muted-foreground">
            Assign a plant to a club member
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-200"
          >
            <FiCheckCircle className="h-4 w-4" />
            <p>Assignment created successfully!</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-200"
          >
            <FiAlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="space-y-2">
              <label htmlFor="userId" className="text-sm font-medium">
                Club Member
              </label>
              <select
                id="userId"
                className="input w-full"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="">Select a member</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="plantId" className="text-sm font-medium">
                Plant
              </label>
              <select
                id="plantId"
                className="input w-full"
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                required
              >
                <option value="">Select a plant</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="input w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date (Optional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="input w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="taskType" className="text-sm font-medium">
                Task Type
              </label>
              <select
                id="taskType"
                className="input w-full"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              >
                <option value="Watering">Watering</option>
                <option value="Fertilizing">Fertilizing</option>
                <option value="Pruning">Pruning</option>
                <option value="Pest Control">Pest Control</option>
                <option value="General Care">General Care</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                className="input min-h-[100px] w-full"
                placeholder="Add any special instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <Link
                href="/admin/assignments"
                className="btn-outline"
              >
                Cancel
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Assignment"}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewAssignmentPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <NewAssignmentContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}
