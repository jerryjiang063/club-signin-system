"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import Link from "next/link";
import { FiUsers, FiPlus, FiEdit, FiAlertCircle } from "react-icons/fi";
import { GiPlantRoots } from "react-icons/gi";
import { Loading } from "@/components/loading";

function AdminContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, session, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Loading text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage plants, users, and assignments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Management Card */}
        <div className="card">
          <div className="card-header">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FiUsers className="h-6 w-6" />
            </div>
            <h2 className="card-title">Users Management</h2>
            <p className="card-description">
              Manage club members and their accounts
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <Link
                href="/admin/users"
                className="btn-primary w-full"
              >
                View All Users
              </Link>
              <Link
                href="/admin/users/new"
                className="btn-outline w-full"
              >
                Add New User
              </Link>
            </div>
          </div>
        </div>

        {/* Plants Management Card */}
        <div className="card">
          <div className="card-header">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GiPlantRoots className="h-6 w-6" />
            </div>
            <h2 className="card-title">Plants Management</h2>
            <p className="card-description">
              Add, edit, and manage plants in the club
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <Link
                href="/admin/plants"
                className="btn-primary w-full"
              >
                View All Plants
              </Link>
              <Link
                href="/admin/plants/new"
                className="btn-outline w-full"
              >
                Add New Plant
              </Link>
            </div>
          </div>
        </div>

        {/* Assignments Management Card */}
        <div className="card">
          <div className="card-header">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FiPlus className="h-6 w-6" />
            </div>
            <h2 className="card-title">Care Assignments</h2>
            <p className="card-description">
              Assign plants to club members for care
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <Link
                href="/admin/assignments"
                className="btn-primary w-full"
              >
                View All Assignments
              </Link>
              <Link
                href="/admin/assignments/new"
                className="btn-outline w-full"
              >
                Create New Assignment
              </Link>
            </div>
          </div>
        </div>

        {/* Site Content Management Card */}
        <div className="card">
          <div className="card-header">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FiEdit className="h-6 w-6" />
            </div>
            <h2 className="card-title">Site Content</h2>
            <p className="card-description">
              Edit website content and homepage
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <Link
                href="/admin/content"
                className="btn-primary w-full"
              >
                Edit Site Content
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-semibold">Recent Activity</h2>
        <div className="card">
          <div className="p-6">
            <p className="text-center text-muted-foreground">
              Activity tracking will be implemented in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <AdminContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}