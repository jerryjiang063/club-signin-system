"use client";

import { GiPlantRoots } from "react-icons/gi";
import { motion } from "framer-motion";

interface LoadingProps {
  text?: string;
}

export function Loading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <GiPlantRoots className="mx-auto h-16 w-16 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-xl font-semibold"
        >
          {text}
        </motion.h2>
      </div>
    </div>
  );
}
