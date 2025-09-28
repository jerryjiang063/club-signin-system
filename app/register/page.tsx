"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { GiPlantRoots } from "react-icons/gi";
import { FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Redirect to login page on successful registration
      router.push("/login?registered=true");
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6 mx-auto"
        >
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <GiPlantRoots className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">
              Join our gardening community today
            </p>
          </div>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-200"
            >
              <FiAlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="John Doe"
                className="input w-full"
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
                placeholder="name@example.com"
                className="input w-full"
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
                placeholder="••••••••"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium leading-none"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="input w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </motion.button>
          </form>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </LayoutWrapper>
  );
}