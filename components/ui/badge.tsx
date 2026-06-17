import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#1A1A2E] text-white",
        secondary: "border-transparent bg-[#F8F7F4] text-[#1A1A2E]",
        outline: "border-[#E2E0D8] text-[#1A1A2E]",
        success: "border-[#E8D5B0] bg-[#E8D5B0]/40 text-[#1A1A2E]",
        warning: "border-[#E8D5B0] bg-[#E8D5B0]/40 text-[#1A1A2E]",
        info: "border-[#E2E0D8] bg-white text-[#1A1A2E]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

