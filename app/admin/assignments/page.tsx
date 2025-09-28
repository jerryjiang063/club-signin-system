"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

interface PlantCare {
  id: string;
  plantId: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  taskType: string | null;
  notes: string | null;
  plant: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

function AssignmentsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<PlantCare[]>([]);
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

    const fetchAssignments = async () => {
      try {
        const response = await fetch("/api/plant-care");
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const data = await response.json();
        setAssignments(data.plantCare || []);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching assignments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchAssignments();
    }
  }, [status, session, router]);

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/plant-care/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete assignment");
      }

      setAssignments(assignments.filter((assignment) => assignment.id !== id));
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting the assignment");
      console.error(err);
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

  const filteredAssignments = searchTerm
    ? assignments.filter(
        (assignment) =>
          assignment.plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (assignment.taskType && assignment.taskType.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : assignments;

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Loading text="Loading assignments..." />
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Plant Care Assignments</h1>
          <p className="text-muted-foreground">
            Manage plant care assignments for club members
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <FiSearch className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link 
          href="/admin/assignments/new" 
          className="btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          New Assignment
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Plant
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Task Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  End Date
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No assignments found
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-muted/50">
                    <td className="px-4 py-4 text-sm">{assignment.plant.name}</td>
                    <td className="px-4 py-4 text-sm">{assignment.user.name}</td>
                    <td className="px-4 py-4 text-sm">{assignment.taskType || "Watering"}</td>
                    <td className="px-4 py-4 text-sm">{formatDate(assignment.startDate)}</td>
                    <td className="px-4 py-4 text-sm">
                      {assignment.endDate ? formatDate(assignment.endDate) : "Ongoing"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/assignments/${assignment.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          aria-label="Edit assignment"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                          aria-label="Delete assignment"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <AssignmentsContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}
