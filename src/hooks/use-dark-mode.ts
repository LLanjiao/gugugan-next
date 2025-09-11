"use client";

import { useEffect, useState } from "react";

export const themeValues = {
  Light: "light",
  Dark: "dark",
} as const;  // as const 让属性变成字面量类型

type Theme = typeof themeValues[keyof typeof themeValues];

export function useDarkMode() {
  // 初始化：从 localStorage 或系统偏好读取
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme | null;
      if (saved) return saved;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light"; // SSR fallback
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 当 theme 改变时，同步到 localStorage + <html> class
  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // 切换函数
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return { theme, setTheme, toggleTheme };
}
