import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm",
        outline: "text-foreground",
        pending: "border-transparent bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))]",
        assigned: "border-transparent bg-[hsl(var(--status-assigned))]/15 text-[hsl(var(--status-assigned))]",
        "picked-up": "border-transparent bg-[hsl(var(--status-picked-up))]/15 text-[hsl(var(--status-picked-up))]",
        "in-transit": "border-transparent bg-[hsl(var(--status-in-transit))]/15 text-[hsl(var(--status-in-transit))]",
        delivered: "border-transparent bg-[hsl(var(--status-delivered))]/15 text-[hsl(var(--status-delivered))]",
        cancelled: "border-transparent bg-[hsl(var(--status-cancelled))]/15 text-[hsl(var(--status-cancelled))]",
        returned: "border-transparent bg-[hsl(var(--status-returned))]/15 text-[hsl(var(--status-returned))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
