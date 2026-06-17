import { Ruler, ScanFace, Sparkles, SwatchBook } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatBackground,
  formatTemplateSize,
  getTemplatePixelSize
} from "@/lib/templates/registry";
import type { DocumentTemplate } from "@/lib/templates/schema";

type TemplateSummaryProps = {
  template: DocumentTemplate;
};

export function TemplateSummary({ template }: TemplateSummaryProps) {
  const pixelSize = getTemplatePixelSize(template);
  const summary = [
    {
      label: "Photo size",
      value: formatTemplateSize(template),
      icon: Ruler
    },
    {
      label: "Pixel output",
      value: `${pixelSize.widthPx} x ${pixelSize.heightPx} px`,
      icon: Sparkles
    },
    {
      label: "Background",
      value: formatBackground(template.background),
      icon: SwatchBook
    },
    {
      label: "Head ratio",
      value: `${template.head_ratio_min}-${template.head_ratio_max}%`,
      icon: ScanFace
    }
  ];

  return (
    <Card className="rounded-[20px] border border-[#E2E0D8] bg-white shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-syne text-[hsl(var(--text))]">Requirement summary</CardTitle>
            <p className="mt-2 text-sm text-[hsl(var(--muted-text))]">
              {template.country} {template.document}
            </p>
          </div>
          <Badge variant="outline">{template.dpi} DPI</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-[16px] border border-[#E2E0D8] bg-[#F8F7F4] p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#1A1A2E]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-medium uppercase text-[hsl(var(--muted-text))]">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-[hsl(var(--text))]">{item.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

