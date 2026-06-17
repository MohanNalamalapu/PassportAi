import { AppShell } from "@/components/shared/AppShell";
import { Navbar } from "@/components/Navbar";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { PhotoTips } from "@/components/PhotoTips";
import { CountrySelector } from "@/components/CountrySelector";

export default function HomePage() {
  return (
    <AppShell>
      <Navbar />
      <StickyCtaBar />
      <HeroSection />
      <HowItWorks />
      <PhotoTips />
      <CountrySelector />
    </AppShell>
  );
}

