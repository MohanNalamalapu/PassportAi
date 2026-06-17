"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { downloadFile } from "@/src/services/export-engine";
import {
  clearProcessingResults,
  readProcessingResults,
  type ProcessingSession
} from "@/lib/storage/sessionResults";

export function ResultsExperience() {
  const [results, setResults] = useState<ProcessingSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setResults(readProcessingResults());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="container py-20 text-center text-slate-600">
        Loading your results...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container py-20">
        <Card>
          <CardHeader>
            <CardTitle>No results yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>Upload and process a photo first to see your passport photo results here.</p>
            <Button asChild>
              <Link href="/upload">Go to upload</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { exportResult, complianceResult } = results;

  return (
    <>
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/upload">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to upload
        </Link>
      </Button>

      <div className="mb-10">
        <Badge variant="info" className="mb-4 border-[#E2E0D8] bg-white/80 text-[hsl(var(--text))]">
          Results ready
        </Badge>
        <h1 className="font-syne text-balance text-4xl font-extrabold tracking-[-0.04em] text-[hsl(var(--text))] sm:text-5xl">
          Your passport photo is ready.
        </h1>
        <p className="mt-4 text-base leading-7 text-[hsl(var(--muted-text))]">
          {results.country} {results.document} — processed and ready to download.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Photo preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                src={results.previewDataUrl}
                alt="Processed passport photo preview"
                width={400}
                height={500}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Download options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exportResult.jpeg ? (
                <Button
                  className="w-full"
                  onClick={() => downloadFile(exportResult.jpeg!, `passport-${results.templateId}.jpg`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download JPEG
                </Button>
              ) : null}
              {exportResult.png ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => downloadFile(exportResult.png!, `passport-${results.templateId}.png`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
              ) : null}
              {exportResult.pdf ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => downloadFile(exportResult.pdf!, `passport-${results.templateId}.pdf`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle>Compliance score</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{complianceResult.score}</div>
                    <div className="text-xs text-slate-600">/ 100</div>
                  </div>
                  {complianceResult.compliant ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-slate-700">
                  {results.backgroundRemoved ? "Background removed" : "Background processed"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-slate-700">Face detected and cropped</span>
              </div>
              <div className="flex items-center gap-2">
                {complianceResult.compliant ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-slate-700">
                  {complianceResult.compliant
                    ? "All compliance checks passed"
                    : `${complianceResult.issues.length} issue(s) found`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {complianceResult.checks.length > 0 ? (
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Detailed compliance checks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {complianceResult.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-sm">
                  {check.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{check.label}</div>
                    {check.message ? <div className="text-slate-600">{check.message}</div> : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-10 flex justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            clearProcessingResults();
            window.location.href = "/upload";
          }}
        >
          Process another photo
        </Button>
      </div>
    </>
  );
}
