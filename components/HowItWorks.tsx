import { Check, Circle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose your document",
    description:
      "Select your country from our catalog of 22+ passport and visa templates. Requirements load instantly.",
    complete: true
  },
  {
    number: "02",
    title: "Upload your selfie",
    description:
      "Drag and drop or browse for a JPEG or PNG. Up to 10 MB, from desktop or mobile.",
    complete: true
  },
  {
    number: "03",
    title: "AI removes background",
    description:
      "Our pipeline calls a protected API to cleanly remove the background and replace it per country rules.",
    complete: true
  },
  {
    number: "04",
    title: "Face landmarks detected",
    description:
      "MediaPipe identifies eyes, chin and hairline — ensuring your head ratio falls within 65-80% of the frame.",
    complete: true
  },
  {
    number: "05",
    title: "Crop & compliance check",
    description:
      "The crop engine applies template dimensions, then runs compliance checks against official requirements.",
    complete: true
  },
  {
    number: "06",
    title: "Download your photo",
    description:
      "Export as JPEG, PNG, or a print-ready PDF. Your photo stays in browser memory only.",
    complete: true
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-[#E2E0D8] bg-white py-20">
      <div className="container grid gap-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E]">How it works</p>
          <h2 className="font-syne mt-4 text-[clamp(2.45rem,4vw,3.25rem)] font-extrabold tracking-[-0.08em] text-[hsl(var(--text))]">
            From selfie to passport-ready output.
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-7 text-[hsl(var(--muted-text))]">
            A clear, simple process — no account, no printing, no stress.
          </p>

          <div className="relative mt-12 space-y-0 border-l-2 border-[#E2E0D8] pl-8">
            {steps.map((step) => (
              <div key={step.number} className="relative border-b border-[#E2E0D8] py-8 last:border-b-0">
                <div className="absolute -left-[2.55rem] top-8 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#1A1A2E] text-[#C9A96E]">
                  {step.number}
                </div>
                <p className="font-syne text-[16px] font-bold text-[hsl(var(--text))]">{step.title}</p>
                <p className="mt-2 max-w-xl text-[14px] leading-7 text-[hsl(var(--muted-text))]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pt-10">
          <div className="sticky top-[140px] rounded-[20px] bg-[#1A1A2E] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
              Processing status
            </p>
            <div className="mt-4 rounded-[18px] border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">India Passport — 35 x 45mm</p>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  ["Template loaded", true],
                  ["Upload validated", true],
                  ["Remove background", false],
                  ["Detect face landmarks", false],
                  ["Crop to document size", false],
                  ["Prepare downloads", false]
                ].map(([label, complete]) => (
                  <div key={label as string} className="flex items-center gap-3 text-white/80">
                    {complete ? (
                      <Check className="h-4 w-4 text-[#C9A96E]" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4 text-white/35" aria-hidden="true" />
                    )}
                    <span>{label as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[16px] border border-[#E8D5B0]/35 bg-[#E8D5B0]/10 p-4 text-sm text-white/80">
              <span className="mr-2">🔒</span>
              Photos stay in browser memory. Nothing is stored in a database.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}