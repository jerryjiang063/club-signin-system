"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

function UsersContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError("An error occurred while fetching users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, session, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading text="Loading users..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          Manage club members and their accounts
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <FiSearch className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/admin/users/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <FiPlus className="h-4 w-4" />
          Add New User
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-4 text-sm">{user.name}</td>
                    <td className="px-4 py-4 text-sm">{user.email}</td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-primary/10 text-primary"
                            : user.role === "MEMBER"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          aria-label="Edit user"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Link>
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                          aria-label="Delete user"
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

export default function UsersPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <UsersContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}