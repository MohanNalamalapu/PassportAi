import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  label: string;
  tone?: "success" | "warning" | "info" | "neutral";
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const variant = tone === "neutral" ? "secondary" : tone;
  return <Badge variant={variant}>{label}</Badge>;
}

