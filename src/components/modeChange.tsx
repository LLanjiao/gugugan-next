"use client";

import { themeValues, useDarkMode } from "@/hooks/use-dark-mode";

export const ScenceModeButton = () => {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <>
      <button
        onClick={toggleTheme}
        className="bg-gray-100 hover:bg-gray-300 w-48 h-12 rounded-2xl"
      >
        当前模式: {theme}
      </button>
      {
        theme === themeValues.Dark ? (
          <div>dark</div>
        ) : (
          <div>light</div>
        )
      }
    </>
  );
};