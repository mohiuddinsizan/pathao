/**
 * Apply a palette's colors as CSS custom properties on an element
 * (typically `document.documentElement`).
 */
export function applyPalette(colors, target = document.documentElement) {
  const entries = Object.entries(colors);
  for (const [key, value] of entries) {
    target.style.setProperty(`--${key}`, value);
  }
}

/**
 * Remove all palette CSS custom properties from an element.
 */
export function clearPalette(target = document.documentElement) {
  const keys = [
    "background", "foreground", "card", "card-foreground",
    "popover", "popover-foreground", "primary", "primary-foreground",
    "secondary", "secondary-foreground", "muted", "muted-foreground",
    "accent", "accent-foreground", "destructive", "destructive-foreground",
    "border", "input", "ring",
    "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
    "sidebar-background", "sidebar-foreground",
    "sidebar-primary", "sidebar-primary-foreground",
    "sidebar-accent", "sidebar-accent-foreground",
    "sidebar-border", "sidebar-ring",
  ];
  for (const key of keys) {
    target.style.removeProperty(`--${key}`);
  }
}
