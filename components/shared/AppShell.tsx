import Link from "next/link";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface))] text-[hsl(var(--text))] flex flex-col justify-between">
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-white/10 bg-[#0F0F1A] text-white/80">
        <div className="container py-12">
          {/* Top section: Logo & Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 text-[#C9A96E]">
                  <span className="block h-4.5 w-4.5 rounded-full border border-current/80" />
                </span>
                <span className="font-syne text-[20px] font-extrabold tracking-[-0.04em] text-white">
                  PassportAI
                </span>
              </div>
              <p className="text-sm text-white/60 max-w-sm leading-6">
                Create compliant, professional-grade passport and visa photos in seconds. Powered by AI-assisted background removal and face cropping.
              </p>
              <div className="flex items-center gap-2 text-xs text-white/55">
                <ShieldCheck className="h-4 w-4 text-[#C9A96E]" />
                <span>100% Client-Side Privacy: No images stored.</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-4">Tools</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/upload" className="hover:text-white transition-colors duration-200">
                    Upload Selfie
                  </Link>
                </li>
                <li>
                  <Link href="/#country-selector" className="hover:text-white transition-colors duration-200">
                    Country Templates
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-white transition-colors duration-200">
                    How it Works
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/#photo-tips" className="hover:text-white transition-colors duration-200">
                    Photo Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-white transition-colors duration-200">
                    AI Crop Engine
                  </Link>
                </li>
                <li>
                  <Link href="/#photo-tips" className="hover:text-white transition-colors duration-200">
                    Compliance Checklist
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} PassportAI. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> & <Sparkles className="h-3 w-3 text-[#C9A96E]" /> for global travelers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

