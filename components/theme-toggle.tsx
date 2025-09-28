"use client";

import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // 服务端渲染或客户端未挂载时，返回占位符
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        <div className="w-5 h-5" />
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="rounded-full p-2 transition-colors hover:bg-secondary"
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolvedTheme}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          {resolvedTheme === "dark" ? (
            <FiSun className="h-5 w-5" />
          ) : (
            <FiMoon className="h-5 w-5" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}