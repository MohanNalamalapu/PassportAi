"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllTemplates, formatTemplateSize } from "@/lib/templates/registry";

export function CountrySelector() {
  const templates = useMemo(() => getAllTemplates(), []);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id ?? "");
  const router = useRouter();

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? templates[0];

  function handleUpload() {
    if (!selectedTemplate) {
      return;
    }

    router.push(`/upload?template=${selectedTemplate.id}`);
  }

  return (
    <section id="country-selector" className="bg-[#1A1A2E] py-20">
      <div className="container">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E]">Start here</p>
        <h2 className="font-syne mt-4 text-[clamp(2.45rem,4vw,3.25rem)] font-extrabold tracking-[-0.08em] text-white">
          Pick your country, upload your selfie.
        </h2>

        <div className="mt-10 grid gap-12 rounded-[20px] border border-white/10 bg-white/5 p-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#C9A96E]">Select country & document</p>
            <label className="relative mt-4 block">
              <select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                className="h-14 w-full appearance-none rounded-[10px] border border-white/10 bg-white/10 px-4 pr-10 text-sm text-white outline-none transition focus:border-[#C9A96E]"
              >
                {templates.map((template) => (
                  <option
                    key={template.id}
                    value={template.id}
                    className="bg-[#1A1A2E] text-white"
                  >
                    {template.country} — {template.document} ({formatTemplateSize(template)})
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A96E]">
                ▾
              </span>
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-white/10 bg-white/10 text-white">22 templates</Badge>
              <Badge className="border-white/10 bg-white/10 text-white">300 DPI output</Badge>
              <Badge className="border-white/10 bg-white/10 text-white">JPEG · PNG · PDF</Badge>
            </div>

            <Button
              onClick={handleUpload}
              className="mt-6 h-14 w-full rounded-[10px] bg-[#C9A96E] font-bold text-[#1A1A2E] hover:bg-[#E8D5B0]"
              variant="secondary"
            >
              Upload your photo →
            </Button>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-white/55">What you get</p>
            <ul className="mt-4 space-y-4 text-[15px] leading-7 text-white/80">
              {[
                "AI background removal",
                "Face-aware smart cropping",
                "Government spec compliance check",
                "JPEG, PNG & print-ready PDF export",
                "Zero data stored — privacy first"
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-[#C9A96E]">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}