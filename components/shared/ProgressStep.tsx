import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProgressStepProps = {
  label: string;
  status: "queued" | "active" | "complete";
};

export function ProgressStep({ label, status }: ProgressStepProps) {
  const icon =
    status === "complete" ? (
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
    ) : status === "active" ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
    ) : (
      <Circle className="h-3.5 w-3.5" aria-hidden="true" />
    );

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/45",
          status === "complete" && "border-[#C9A96E]/30 bg-[#C9A96E]/15 text-[#C9A96E]",
          status === "active" && "border-[#C9A96E]/30 bg-white/10 text-white"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-sm text-white/55",
          status === "complete" && "text-white/90",
          status === "active" && "font-medium text-white"
        )}
      >
        {label}
      </span>
    </div>
  );
}

