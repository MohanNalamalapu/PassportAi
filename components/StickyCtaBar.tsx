"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function StickyCtaBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");

    if (!hero) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  function handleAction() {
    if (pathname === "/") {
      const target = document.getElementById("country-selector");

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    router.push("/upload");
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="sticky top-16 z-40 border-b border-[#1A1A2E] bg-[#1A1A2E]">
      <div className="container flex h-16 items-center justify-between gap-4">
        <p className="text-sm font-medium text-white/75">Ready in under 15 seconds. No account needed.</p>
        <Button onClick={handleAction} className="rounded-[8px] bg-[#C9A96E] px-5 font-bold text-[#1A1A2E] hover:bg-[#E8D5B0]" variant="secondary">
          📸 Take your photo now
        </Button>
      </div>
    </div>
  );
}