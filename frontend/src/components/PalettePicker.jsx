import { Palette } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PalettePicker() {
  const { palette, allPalettes, setPalette } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Choose color palette</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {allPalettes.map((p) => (
          <DropdownMenuItem
            key={p.name}
            onClick={() => setPalette(p.name)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {/* 4-color swatch */}
            <span className="flex gap-0.5 shrink-0">
              {p.swatches?.map((hex, i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-full border border-foreground/20"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </span>

            {/* Label */}
            <span className="truncate text-sm">{p.label}</span>

            {/* Active indicator */}
            {p.name === palette.name && (
              <span className="ml-auto text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
