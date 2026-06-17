"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, LockKeyhole, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountrySelector } from "@/components/upload/CountrySelector";
import { ProcessingTimeline } from "@/components/upload/ProcessingTimeline";
import { TemplateSummary } from "@/components/upload/TemplateSummary";
import { UploadDropzone, type UploadedImage } from "@/components/upload/UploadDropzone";
import {
  persistSelectedTemplate,
  readSelectedTemplateId
} from "@/lib/storage/localSession";
import { cropImageToDataUrl, loadImageFromFile, loadImageFromDataUrl } from "@/src/lib/image-utils";
import { derivePassportCrop } from "@/src/services/crop-engine";
import { detectFaceLandmarks } from "@/src/lib/face-detection-browser";
import { analyzeImageElement, transformFeaturesForCrop } from "@/src/lib/compliance-validators";
import { evaluateCompliance } from "@/src/services/compliance-engine";
import { exportPassportPhoto, downloadFile } from "@/src/services/export-engine";
import { persistProcessingResults } from "@/lib/storage/sessionResults";
import type { DocumentTemplate } from "@/lib/templates/schema";
import type { FaceDetectionResult } from "@/src/types/face";
import type { ComplianceResult } from "@/src/types/compliance";
import type { ExportResult } from "@/src/types/export";

type UploadExperienceProps = {
  templates: DocumentTemplate[];
  defaultTemplate: DocumentTemplate;
  initialTemplateId?: string;
};

export function UploadExperience({ templates, defaultTemplate, initialTemplateId }: UploadExperienceProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    const storedTemplateId = initialTemplateId ?? readSelectedTemplateId();
    const storedTemplate = templates.find((template) => template.id === storedTemplateId);

    if (storedTemplate) {
      setSelectedTemplateId(storedTemplate.id);
    }
  }, [initialTemplateId, templates]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? defaultTemplate,
    [defaultTemplate, selectedTemplateId, templates]
  );
  const [faceData, setFaceData] = useState<FaceDetectionResult | null>(null);
  const [passportCropData, setPassportCropData] = useState<string | null>(null);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [backgroundRemovalWarning, setBackgroundRemovalWarning] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  function handleTemplateChange(template: DocumentTemplate) {
    setSelectedTemplateId(template.id);
    persistSelectedTemplate(template);
    setUploadedImage(null);
    setFaceData(null);
    setPassportCropData(null);
    setProcessingError(null);
    setBackgroundRemovalWarning(null);
    setComplianceResult(null);
    setExportResult(null);
  }

  async function processUploadedImage(image: UploadedImage, template: DocumentTemplate) {
    setIsProcessing(true);
    setProcessingError(null);
    setBackgroundRemovalWarning(null);
    setComplianceResult(null);
    setBackgroundRemoved(false);

    try {
      // Attempt server-side background removal first. If it succeeds, use the
      // processed image for detection. Otherwise, fall back to the original file.
      let detectionImage: HTMLImageElement | null = null;

      try {
        const form = new FormData();
        form.set("image", image.file);
        form.set("templateId", template.id);

        const res = await fetch("/api/remove-background", { method: "POST", body: form });
        const payload = await res.json();

        if (res.ok && payload && payload.success && payload.image?.base64) {
          const dataUrl = `data:${payload.image.mimeType};base64,${payload.image.base64}`;
          detectionImage = await loadImageFromDataUrl(dataUrl);
        } else {
          setBackgroundRemovalWarning(
            payload?.error?.message ??
              "Background removal did not complete. Continuing with the original photo."
          );
        }
      } catch (err) {
        setBackgroundRemovalWarning(
          err instanceof Error
            ? `Background removal failed: ${err.message}`
            : "Background removal failed. Continuing with the original photo."
        );
        console.warn("Background removal failed, falling back to original image:", err);
      }

      const img = detectionImage ?? (await loadImageFromFile(image.file));
      const backgroundWasRemoved = Boolean(detectionImage);

      if (backgroundWasRemoved) setBackgroundRemoved(true);
      const detection = await detectFaceLandmarks(img);

      if (detection.faceCount !== 1) {
        throw new Error("Please upload a photo with a single visible face.");
      }

      setFaceData(detection);

      const cropResult = derivePassportCrop({
        template,
        sourceWidth: detection.sourceWidth,
        sourceHeight: detection.sourceHeight,
        faceBoundingBox: detection.boundingBox,
        leftEye: detection.features.leftEye,
        rightEye: detection.features.rightEye,
        noseTip: detection.features.noseTip,
        chin: detection.features.chin,
        forehead: detection.features.forehead
      });

      const croppedDataUrl = await cropImageToDataUrl(
        img,
        cropResult.crop,
        cropResult.outputWidth,
        cropResult.outputHeight
      );
      setPassportCropData(croppedDataUrl);

      setIsAnalyzing(true);
      try {
        const croppedImg = await loadImageFromDataUrl(croppedDataUrl);
        const croppedFeatures = transformFeaturesForCrop(
          detection.features,
          cropResult.crop,
          cropResult.outputWidth,
          cropResult.outputHeight
        );
        const imageAnalysis = await analyzeImageElement(croppedImg, croppedFeatures);
        const compliance = evaluateCompliance({
          template,
          crop: cropResult,
          faceData: detection,
          imageAnalysis,
          sourceWidth: detection.sourceWidth,
          sourceHeight: detection.sourceHeight,
          backgroundRemoved: backgroundWasRemoved
        });
        setComplianceResult(compliance);

        setIsExporting(true);
        try {
          const exports = await exportPassportPhoto(
            img,
            cropResult.crop,
            cropResult.outputWidth,
            cropResult.outputHeight
          );
          setExportResult(exports);

          persistProcessingResults({
            templateId: template.id,
            country: template.country,
            document: template.document,
            previewDataUrl: croppedDataUrl,
            exportResult: exports,
            complianceResult: compliance,
            backgroundRemoved: backgroundWasRemoved,
            sourceWidth: detection.sourceWidth,
            sourceHeight: detection.sourceHeight,
            processedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Export failed:", error);
        } finally {
          setIsExporting(false);
        }
      } catch (error) {
        console.error("Compliance analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : "Face detection failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (uploadedImage) {
      void processUploadedImage(uploadedImage, selectedTemplate);
    } else {
      setFaceData(null);
      setPassportCropData(null);
      setProcessingError(null);
      setComplianceResult(null);
      setExportResult(null);
      setBackgroundRemoved(false);
      setBackgroundRemovalWarning(null);
    }
  }, [uploadedImage, selectedTemplate]);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[hsl(var(--surface))] py-10 lg:py-14">
      <div className="container">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-syne text-balance text-4xl font-extrabold tracking-[-0.04em] text-[hsl(var(--text))] sm:text-5xl">
              Upload your photo. Get a compliant passport image.
            </h1>
            <p className="mt-4 text-base leading-7 text-[hsl(var(--muted-text))]">
              Background removal, face detection, template-driven cropping, compliance checks,
              and multi-format export — all in one workflow.
            </p>
          </div>
          {exportResult ? (
            <Button asChild variant="outline">
              <Link href="/results">
                View results
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              View results
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <CountrySelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
            />
            <TemplateSummary template={selectedTemplate} />
          </div>
          <div className="space-y-5">
            <UploadDropzone
              selectedTemplate={selectedTemplate}
              uploadedImage={uploadedImage}
              onImageChange={setUploadedImage}
            />
            <ProcessingTimeline
              hasImage={Boolean(uploadedImage)}
              backgroundRemoved={backgroundRemoved}
              faceDetected={Boolean(faceData)}
              cropReady={Boolean(passportCropData)}
              complianceComplete={Boolean(complianceResult)}
              exportsReady={Boolean(exportResult)}
            />

            {backgroundRemovalWarning ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="font-semibold">Background removal fallback</p>
                <p className="mt-1">{backgroundRemovalWarning}</p>
              </div>
            ) : null}

            {uploadedImage ? (
              <div className="space-y-4">
                {isProcessing ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analyzing photo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">
                        The face detection model is locating the face and preparing your passport crop.
                      </p>
                    </CardContent>
                  </Card>
                ) : processingError ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    <p className="font-semibold">Face detection error</p>
                    <p className="mt-2">{processingError}</p>
                  </div>
                ) : passportCropData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Passport crop preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                          <Image
                            src={passportCropData}
                            alt="Passport-ready crop preview"
                            width={320}
                            height={400}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="space-y-3 text-sm text-slate-700">
                          <p>
                            Face detection succeeded. The photo was framed with headroom above the
                            hair and shoulders visible, matching passport photo standards.
                          </p>
                          {faceData ? (
                            <p className="text-slate-600">
                              Head region detected. Final crop includes shoulders per passport framing rules.
                            </p>
                          ) : null}
                          <p className="font-semibold">Template:</p>
                          <p>
                            {selectedTemplate.country} {selectedTemplate.document}
                          </p>
                          <p className="font-semibold">Source image:</p>
                          <p>
                            {uploadedImage.width} x {uploadedImage.height} px
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {isAnalyzing ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Running compliance checks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">
                        Analyzing brightness, sharpness, head position, and other photo requirements...
                      </p>
                    </CardContent>
                  </Card>
                ) : complianceResult ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>Compliance check</CardTitle>
                          <p className="mt-1 text-sm text-slate-600">
                            {complianceResult.compliant
                              ? "Your photo meets all passport requirements."
                              : "Your photo has some issues that may affect acceptance."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                              {complianceResult.score}
                            </div>
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
                    <CardContent className="space-y-4">
                      {complianceResult.issues.length > 0 ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-red-700">Issues:</p>
                          <ul className="space-y-1">
                            {complianceResult.issues.map((issue, idx) => (
                              <li key={idx} className="text-sm text-red-600">
                                • {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {complianceResult.warnings.length > 0 ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-amber-700">Warnings:</p>
                          <ul className="space-y-1">
                            {complianceResult.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm text-amber-600">
                                • {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="space-y-2 border-t border-slate-200 pt-3">
                        <p className="text-xs font-semibold text-slate-700">Detailed checks:</p>
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
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {isExporting ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Exporting photo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">
                        Generating JPEG, PNG, and PDF versions of your passport photo...
                      </p>
                    </CardContent>
                  </Card>
                ) : exportResult ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Download your passport photo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {exportResult.jpeg ? (
                        <Button
                          className="w-full"
                          onClick={() => downloadFile(exportResult.jpeg!, `passport-${selectedTemplate.id}.jpg`)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download JPEG
                        </Button>
                      ) : null}
                      {exportResult.png ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => downloadFile(exportResult.png!, `passport-${selectedTemplate.id}.png`)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PNG
                        </Button>
                      ) : null}
                      {exportResult.pdf ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => downloadFile(exportResult.pdf!, `passport-${selectedTemplate.id}.pdf`)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      ) : null}
                      <Button asChild variant="premium" className="w-full">
                        <Link href="/results">View full results page</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-[20px] border border-[#E2E0D8] bg-white p-5 text-sm text-[hsl(var(--muted-text))]">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F8F7F4] text-[#1A1A2E]">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-[hsl(var(--text))]">Privacy posture for V1</p>
                  <p className="mt-1 leading-6">
                    Selected templates can persist locally, but uploaded photos stay in browser
                    memory for this workflow and are not stored in a database.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
