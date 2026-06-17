import { Badge } from "@/components/ui/badge";

export function BeforeAfterCard() {
  return (
    <div className="rounded-[20px] bg-[#1A1A2E] p-7 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 relative overflow-hidden">
      {/* Laser light gradient background effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#C9A96E]/10 blur-[50px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px] pointer-events-none" />

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.1; }
          50% { top: 100%; opacity: 0.7; }
        }
        .animate-scan {
          animation: scan 4s ease-in-out infinite;
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(201, 169, 110, 0.3); box-shadow: 0 0 5px rgba(201, 169, 110, 0.1); }
          50% { border-color: rgba(201, 169, 110, 0.8); box-shadow: 0 0 15px rgba(201, 169, 110, 0.4); }
        }
        .animate-pulse-border {
          animation: pulse-border 2.5s infinite;
        }
        @keyframes flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-flow {
          background-size: 200% 200%;
          animation: flow 4s ease infinite;
        }
      `}</style>

      <div className="mb-6 flex items-center justify-between gap-4 relative z-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C9A96E]">AI Compliance Check</span>
          <h3 className="mt-1 font-syne text-[20px] font-extrabold tracking-[-0.03em] text-white">India Passport Standard</h3>
        </div>
        <Badge className="border-0 bg-[#E8D5B0] text-[#1A1A2E] font-bold px-3 py-1 flex items-center gap-1.5 shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Active Pipeline
        </Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 relative z-10">
        {/* Left Side: Before */}
        <div className="space-y-2">
          <div className="relative aspect-[35/45] w-full overflow-hidden rounded-[16px] border border-white/10 bg-[#12121E]">
            {/* Cropped Before Image (Left 50% of animation.jpg) */}
            <img 
              className="absolute top-0 left-0 w-[200%] h-full max-w-none object-cover pointer-events-none" 
              src="/animation.jpg" 
              alt="Original photo" 
            />
            
            {/* Dark Overlay for Before */}
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />

            {/* Scanning line animation */}
            <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent animate-scan pointer-events-none" />

            {/* Label Badge */}
            <span className="absolute left-3 top-3 bg-black/60 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white/90 px-2 py-1 rounded-[6px] border border-white/10">
              Before
            </span>

            {/* Dimension Indicators for Before - Original Selfie */}
            <span className="absolute bottom-3 left-3 text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded-[4px] backdrop-blur-sm">
              Original Background
            </span>
          </div>
          <p className="text-center text-xs font-medium text-white/60">Source Selfie</p>
        </div>

        {/* Right Side: After */}
        <div className="space-y-2">
          <div className="relative aspect-[35/45] w-full overflow-hidden rounded-[16px] border border-[#C9A96E]/30 bg-white">
            {/* Cropped After Image (Right 50% of animation.jpg) */}
            <img 
              className="absolute top-0 left-[-100%] w-[200%] h-full max-w-none object-cover pointer-events-none" 
              src="/animation.jpg" 
              alt="Processed photo" 
            />

            {/* Bounding box (Face tracking rectangle) */}
            <div className="absolute top-[17%] left-[24%] w-[52%] h-[56%] border-2 border-dashed border-[#C9A96E]/80 rounded-[8px] animate-pulse-border pointer-events-none">
              {/* Corner brackets inside the bounding box */}
              <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-[3px] border-l-[3px] border-[#C9A96E]" />
              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-[3px] border-r-[3px] border-[#C9A96E]" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-[3px] border-l-[3px] border-[#C9A96E]" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-[3px] border-r-[3px] border-[#C9A96E]" />
            </div>

            {/* Height dimension guide lines */}
            <div className="absolute right-2 top-[10%] bottom-[10%] w-[1px] bg-[#C9A96E]/40 pointer-events-none">
              <div className="absolute right-[-2px] top-0 border-l-[3px] border-r-[3px] border-b-[6px] border-transparent border-b-[#C9A96E]" />
              <div className="absolute right-[-2px] bottom-0 border-l-[3px] border-r-[3px] border-t-[6px] border-transparent border-t-[#C9A96E]" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1A1A2E] text-[9px] text-[#C9A96E] px-1 py-0.5 rounded font-mono font-bold border border-[#C9A96E]/20 whitespace-nowrap shadow-md">
                45 mm
              </span>
            </div>

            {/* Width dimension guide lines */}
            <div className="absolute bottom-3 left-[15%] right-[15%] h-[1px] bg-[#C9A96E]/40 pointer-events-none">
              <div className="absolute left-0 bottom-[-2px] border-t-[3px] border-b-[3px] border-r-[6px] border-transparent border-r-[#C9A96E]" />
              <div className="absolute right-0 bottom-[-2px] border-t-[3px] border-b-[3px] border-l-[6px] border-transparent border-l-[#C9A96E]" />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-[9px] text-[#C9A96E] px-1 py-0.5 rounded font-mono font-bold border border-[#C9A96E]/20 whitespace-nowrap shadow-md">
                35 mm
              </span>
            </div>

            {/* Label Badge */}
            <span className="absolute left-3 top-3 bg-[#C9A96E] text-black text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-[6px] shadow-lg">
              After
            </span>
          </div>
          <p className="text-center text-xs font-medium text-white/60">AI Cropped & White Background</p>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-3 relative z-10">
        {[
          "✓ Template matching",
          "✓ Background removed",
          "✓ Centered & cropped"
        ].map((item, index) => (
          <div
            key={item}
            className="rounded-[12px] bg-white/5 border border-white/10 px-3 py-2.5 text-center text-xs text-white/80 flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}