"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import Link from "next/link";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

function NewUserContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

    if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess(true);
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("MEMBER");
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading..." />;
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
          <h1 className="text-3xl font-bold">Add New User</h1>
          <p className="text-muted-foreground">
            Create a new account for a club member
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
            <p>User created successfully!</p>
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
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="input w-full"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input w-full"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium leading-none"
              >
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
                <option value="GUEST">Guest</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-4">
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
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create User"}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewUserPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <NewUserContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}