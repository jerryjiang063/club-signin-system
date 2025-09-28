"use client";

import { FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <FiAlertCircle className="mx-auto h-16 w-16 text-red-500" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-xl font-semibold"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-muted-foreground"
        >
          {message}
        </motion.p>
        {onRetry && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="btn-primary mt-4"
          >
            Retry
          </motion.button>
        )}
      </div>
    </div>
  );
}
