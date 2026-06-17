import { CircleAlert, Crosshair, Image, Lightbulb, MinusCircle, PersonStanding } from "lucide-react";

const tips = [
  {
    title: "Natural, even lighting",
    description:
      "Face a window or sit under a bright room light. Avoid harsh shadows on your face or behind you.",
    icon: Lightbulb,
    tone: "bg-emerald-50 text-emerald-700"
  },
  {
    title: "Face the camera directly",
    description:
      "Keep your head level, eyes open, and look straight at the lens. No tilting or angling.",
    icon: Crosshair,
    tone: "bg-[#E8D5B0]/30 text-[#1A1A2E]"
  },
  {
    title: "Correct framing",
    description:
      "Your head should fill 65-80% of the photo height. Leave some space above the crown of your head.",
    icon: PersonStanding,
    tone: "bg-emerald-50 text-emerald-700"
  },
  {
    title: "No glasses or hats",
    description:
      "Remove glasses, hats, caps, or anything covering your face — most passports require a bare face.",
    icon: CircleAlert,
    tone: "bg-rose-50 text-rose-700"
  },
  {
    title: "Plain background",
    description:
      "Stand against a white or light-coloured wall. Our AI will clean it up, but a plain background helps accuracy.",
    icon: Image,
    tone: "bg-[#E8D5B0]/30 text-[#1A1A2E]"
  },
  {
    title: "Neutral expression",
    description:
      "Keep a relaxed, neutral expression with your mouth closed. No big smiles for most passport authorities.",
    icon: MinusCircle,
    tone: "bg-rose-50 text-rose-700"
  }
];

export function PhotoTips() {
  return (
    <section id="photo-tips" className="bg-[hsl(var(--surface))] py-20">
      <div className="container">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E]">How to take your photo</p>
        <h2 className="font-syne mt-4 text-[clamp(2.45rem,4vw,3.25rem)] font-extrabold tracking-[-0.08em] text-[hsl(var(--text))]">
          Get it right the first time.
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[hsl(var(--muted-text))]">
          Follow these simple guidelines to ensure your photo passes compliance on the first try.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tips.map((tip) => {
            const Icon = tip.icon;

            return (
              <div key={tip.title} className="rounded-[16px] border border-[#E2E0D8] bg-white p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${tip.tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-syne mt-5 text-[18px] font-bold text-[hsl(var(--text))]">
                  {tip.title}
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-[hsl(var(--muted-text))]">
                  {tip.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}