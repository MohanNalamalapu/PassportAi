import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="PassportAI home">
      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#1A1A2E] text-[#C9A96E]">
        <span className="block h-4 w-4 rounded-full border border-current/80" />
      </span>
      <span className="font-syne text-[18px] font-extrabold tracking-[-0.04em] text-[#1A1A2E]">
        PassportAI
      </span>
    </Link>
  );
}

