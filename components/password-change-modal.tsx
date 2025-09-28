"use client";

import { useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while changing password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
            disabled={isSubmitting}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-300">
              <FiCheckCircle className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Password Changed Successfully</h3>
            <p className="text-center text-sm text-muted-foreground">
              Your password has been updated. You can now use your new password to log in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-200">
                <FiAlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="input w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="input w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Changing..." : "Change Password"}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
