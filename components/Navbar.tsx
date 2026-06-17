"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function scrollToSection(id: string) {
    if (pathname === "/") {
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    router.push(`/#${id}`);
  }

  return (
    <header className={`${className ?? ""} sticky top-0 z-50 border-b border-[#E2E0D8] bg-[rgba(248,247,244,0.95)] backdrop-blur-md`}>
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm text-[hsl(var(--muted-text))] md:flex">
          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="transition hover:text-[hsl(var(--text))]"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("photo-tips")}
            className="transition hover:text-[hsl(var(--text))]"
          >
            How to take a photo
          </button>
          <Link className="transition hover:text-[hsl(var(--text))]" href="/upload">
            Upload
          </Link>
        </nav>

        <Button asChild className="hidden rounded-[8px] px-5 py-2.5 font-semibold md:inline-flex" variant="premium">
          <Link href="/upload">Get started</Link>
        </Button>
      </div>
    </header>
  );
}