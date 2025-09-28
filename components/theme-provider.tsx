"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  // 当组件挂载时，从 localStorage 中获取主题设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem("theme") as Theme | null;
      
      if (savedTheme && ["dark", "light", "system"].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
      
      setMounted(true);
    }
  }, []);

  // 设置主题的函数
  const setTheme = React.useCallback((theme: Theme) => {
    if (typeof window === 'undefined') return;
    
    setThemeState(theme);
    
    // 保存到 localStorage
    window.localStorage.setItem("theme", theme);
    
    // 如果启用了过渡禁用，则添加类以禁用过渡
    if (disableTransitionOnChange) {
      document.documentElement.classList.add("disable-transitions");
    }
    
    // 应用主题
    const isDark = 
      theme === "dark" || 
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
      setResolvedTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setResolvedTheme("light");
    }
    
    // 移除过渡禁用类
    if (disableTransitionOnChange) {
      window.setTimeout(() => {
        document.documentElement.classList.remove("disable-transitions");
      }, 0);
    }
  }, [disableTransitionOnChange]);

  // 当主题改变时，应用主题
  useEffect(() => {
    if (!mounted) return;
    
    setTheme(theme);
  }, [theme, mounted, setTheme]);

  // 监听系统主题变化
  useEffect(() => {
    if (!mounted || !enableSystem) return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const isDark = mediaQuery.matches;
        setResolvedTheme(isDark ? "dark" : "light");
        
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, mounted]);

  // 服务端渲染或客户端未挂载时，直接返回子组件
  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};