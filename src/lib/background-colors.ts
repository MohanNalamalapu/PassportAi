import type { BackgroundRequirement } from "@/src/types/passport";

const backgroundColors: Record<BackgroundRequirement, { hex: string; label: string }> = {
  white: { hex: "#FFFFFF", label: "White" },
  off_white: { hex: "#F8F7F4", label: "Off White" },
  light_gray: { hex: "#E5E7EB", label: "Light Gray" },
  blue: { hex: "#DCE9F7", label: "Blue" }
};

export function resolveBackgroundColor(requirement: BackgroundRequirement): {
  hex: string;
  label: string;
} {
  if (requirement.startsWith("#")) {
    return {
      hex: requirement,
      label: requirement
    };
  }

  return backgroundColors[requirement];
}
