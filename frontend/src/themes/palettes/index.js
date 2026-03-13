/**
 * Palette Registry
 *
 * All palettes are registered here. Each palette declares its own
 * mode ("light" | "dark") which controls the Tailwind `.dark` class.
 */

import { obsidianIndigo } from "./obsidian-indigo";
import { midnightViolet } from "./midnight-violet";
import { crystalIndigo } from "./crystal-indigo";
import { ivorySlate } from "./ivory-slate";

export const allPalettes = [
  obsidianIndigo,
  midnightViolet,
  crystalIndigo,
  ivorySlate,
];

const paletteMap = Object.fromEntries(
  allPalettes.map((p) => [p.name, p]),
);

export const DEFAULT_PALETTE = obsidianIndigo.name;

export function getPaletteByName(name) {
  return paletteMap[name];
}

export { obsidianIndigo, midnightViolet, crystalIndigo, ivorySlate };
