"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  resolved: "light",
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "ledra_theme";
const COOKIE_KEY = "__theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", resolved);
  document.cookie = `${COOKIE_KEY}=${resolved};path=/;max-age=31536000;SameSite=Lax`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  // Prevents the [mode] effect from firing before localStorage is read on mount
  const skipInitialModeEffect = useRef(true);

  // Read localStorage once on mount, apply correct theme immediately
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const m = (saved && ["light", "dark", "system"].includes(saved) ? saved : "system") as ThemeMode;
    const r = m === "system" ? getSystemTheme() : m;
    setModeState(m);
    setResolved(r);
    applyTheme(r);
  }, []);

  // Apply theme when mode changes — skips the very first run to avoid
  // overwriting the correct theme with the uninitialized "system" default
  useEffect(() => {
    if (skipInitialModeEffect.current) {
      skipInitialModeEffect.current = false;
      return;
    }
    const r = mode === "system" ? getSystemTheme() : mode;
    setResolved(r);
    applyTheme(r);
  }, [mode]);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const r = e.matches ? "dark" : "light";
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
