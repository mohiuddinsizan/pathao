import { createContext, useContext, useEffect, useState } from "react";
import { applyPalette } from "@/themes/apply-palette";
import {
  getPaletteByName,
  allPalettes,
  DEFAULT_PALETTE,
} from "@/themes/palettes";

const ThemeContext = createContext(undefined);

const LS_PALETTE = "palette";

function getInitialPaletteName() {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  const stored = localStorage.getItem(LS_PALETTE);
  if (stored && getPaletteByName(stored)) return stored;
  return DEFAULT_PALETTE;
}

export function ThemeProvider({ children }) {
  const [paletteName, setPaletteName] = useState(getInitialPaletteName);

  const palette = getPaletteByName(paletteName) ?? getPaletteByName(DEFAULT_PALETTE);
  const theme = palette.mode;

  useEffect(() => {
    const root = document.documentElement;

    if (palette.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    applyPalette(palette.colors);
    localStorage.setItem(LS_PALETTE, paletteName);
  }, [palette, paletteName]);

  const setPalette = (name) => {
    if (getPaletteByName(name)) setPaletteName(name);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        palette,
        paletteName,
        allPalettes,
        setPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
