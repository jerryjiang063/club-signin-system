"use client";

import { useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailSettingsModal({ isOpen, onClose }: EmailSettingsModalProps) {
  const [receiveReminders, setReceiveReminders] = useState(true);
  const [receiveDailyUpdates, setReceiveDailyUpdates] = useState(true);
  const [receiveWeeklyUpdates, setReceiveWeeklyUpdates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // In a real app, you would save these settings to the database
      // For this example, we'll just simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving settings");
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
          <h2 className="text-xl font-semibold">Email Notification Settings</h2>
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
            <h3 className="mb-2 text-lg font-medium">Settings Saved</h3>
            <p className="text-center text-sm text-muted-foreground">
              Your email notification preferences have been updated.
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Plant Care Reminders</h3>
                  <p className="text-xs text-muted-foreground">
                    Receive reminders about your plant care assignments
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={receiveReminders}
                    onChange={() => setReceiveReminders(!receiveReminders)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Daily Updates</h3>
                  <p className="text-xs text-muted-foreground">
                    Receive daily updates about plant activities
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={receiveDailyUpdates}
                    onChange={() => setReceiveDailyUpdates(!receiveDailyUpdates)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Weekly Summary</h3>
                  <p className="text-xs text-muted-foreground">
                    Receive weekly summary of club activities
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={receiveWeeklyUpdates}
                    onChange={() => setReceiveWeeklyUpdates(!receiveWeeklyUpdates)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
                {isSubmitting ? "Saving..." : "Save Settings"}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
