import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeforeAfterCard } from "@/components/BeforeAfterCard";

export function HeroSection() {
  return (
    <section id="hero" className="bg-[hsl(var(--surface))]">
      <div className="container grid items-center gap-16 px-6 pb-16 pt-20 lg:grid-cols-2 lg:gap-20 lg:py-20">
        <div className="max-w-2xl">
          <Badge className="rounded-full border-[#E8D5B0] bg-[#C9A96E]/12 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C9A96E]">
            ✦ Passport photos in seconds
          </Badge>
          <h1 className="font-syne mt-6 text-[clamp(3.1rem,5vw,3.55rem)] font-extrabold leading-[1.05] tracking-[-0.09em] text-[hsl(var(--text))]">
            Perfect passport photos, <span className="text-[#C9A96E]">instantly.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-7 text-[hsl(var(--muted-text))]">
            Upload a selfie, pick your country, and receive a compliant, government-ready passport photo — with AI background removal, face-aware cropping, and export in seconds.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-[10px] px-6 py-3.5 font-semibold" variant="premium">
              <Link href="#country-selector">Start with a photo</Link>
            </Button>
            <Button asChild className="rounded-[10px] border-[#E2E0D8] px-6 py-3.5 font-semibold" variant="outline">
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        <BeforeAfterCard />
      </div>
    </section>
  );
}