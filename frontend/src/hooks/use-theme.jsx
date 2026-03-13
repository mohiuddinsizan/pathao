import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);
const LS_KEY = "theme";

function getInitial() {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(LS_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(LS_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  const setTheme = (t) => {
    if (t === "dark" || t === "light") setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
