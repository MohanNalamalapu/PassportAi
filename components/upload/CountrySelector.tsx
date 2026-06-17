"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTemplateSize } from "@/lib/templates/registry";
import type { DocumentTemplate } from "@/lib/templates/schema";

type CountrySelectorProps = {
  templates: DocumentTemplate[];
  selectedTemplate: DocumentTemplate;
  onTemplateChange: (template: DocumentTemplate) => void;
};

export function CountrySelector({
  templates,
  selectedTemplate,
  onTemplateChange
}: CountrySelectorProps) {
  const groupedTemplates = useMemo(() => templates, [templates]);

  return (
    <Card className="rounded-[20px] border border-[#E2E0D8] bg-white shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-syne text-[#1A1A2E]">Country selector</CardTitle>
            <p className="mt-2 text-sm text-[hsl(var(--muted-text))]">
              Choose a document template before uploading.
            </p>
          </div>
          <Badge variant="secondary">{templates.length} templates</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <label className="relative block">
          <span className="sr-only">Country and document</span>
          <select
            value={selectedTemplate.id}
            onChange={(event) => {
              const template = groupedTemplates.find((item) => item.id === event.target.value);

              if (template) {
                onTemplateChange(template);
              }
            }}
            className="h-12 w-full appearance-none rounded-[10px] border border-[#E2E0D8] bg-white px-4 pr-10 text-sm text-[#1A1A2E] outline-none transition focus:border-[#C9A96E]"
          >
            {groupedTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.country} — {template.document} ({formatTemplateSize(template)})
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A96E]">
            ▾
          </span>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{templates.length} templates</Badge>
          <Badge variant="secondary">300 DPI output</Badge>
          <Badge variant="secondary">JPEG · PNG · PDF</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

