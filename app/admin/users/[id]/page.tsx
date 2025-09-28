"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiTrash2, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

function EditUserContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    const fetchUser = async () => {
      if (!userId) return;
      
      try {
        console.log("Fetching user with ID:", userId);
        const response = await fetch(`/api/admin/users/${userId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("User data:", data);
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setRole(data.user.role);
      } catch (err: any) {
        setError(`An error occurred while fetching user data: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUser();
    }
  }, [status, session, router, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      setSuccess(true);
      
      // Update the user data
      const data = await response.json();
      setUser(data.user);
      
      // Show success message for 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      // Redirect back to users list
      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting user");
      setDeleting(false);
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
        <Loading text="Loading user details..." />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay
          message={error || "User not found"}
          onRetry={() => window.location.reload()}
        />
        <div className="flex justify-center mt-6">
          <Link href="/admin/users" className="btn-primary">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/users"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">
            Update user details and permissions
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
            <p>User updated successfully!</p>
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
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                className="input w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {user && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Joined
                </label>
                <p className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="btn-outline-danger flex items-center gap-2"
                disabled={saving || deleting}
              >
                <FiTrash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete User"}
              </button>
              
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/users"
                  className="btn-outline"
                >
                  Cancel
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={saving || deleting}
                >
                  <FiSave className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditUserPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <EditUserContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}
