"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStep } from "@/components/shared/ProgressStep";

type ProcessingTimelineProps = {
  hasImage: boolean;
  backgroundRemoved?: boolean;
  faceDetected?: boolean;
  cropReady?: boolean;
  complianceComplete?: boolean;
  exportsReady?: boolean;
};

export function ProcessingTimeline({
  hasImage,
  backgroundRemoved = false,
  faceDetected = false,
  cropReady = false,
  complianceComplete = false,
  exportsReady = false
}: ProcessingTimelineProps) {
  return (
    <Card className="rounded-[20px] border border-[#E2E0D8] bg-[#1A1A2E] text-white shadow-none">
      <CardHeader>
        <CardTitle className="font-syne text-white">Processing readiness</CardTitle>
        <p className="mt-2 text-sm text-white/70">
          Upload validation, background removal, face detection, cropping, compliance, and export.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ProgressStep
            label={hasImage ? "Image uploaded and validated" : "Waiting for image upload"}
            status={hasImage ? "complete" : "active"}
          />
          <ProgressStep label="Remove background" status={backgroundRemoved ? "complete" : hasImage ? "active" : "queued"} />
          <ProgressStep label="Detect face landmarks" status={faceDetected ? "complete" : backgroundRemoved ? "active" : "queued"} />
          <ProgressStep label="Crop to document size" status={cropReady ? "complete" : faceDetected ? "active" : "queued"} />
          <ProgressStep label="Run compliance checks" status={complianceComplete ? "complete" : cropReady ? "active" : "queued"} />
          <ProgressStep label="Prepare downloads" status={exportsReady ? "complete" : complianceComplete ? "active" : "queued"} />
        </div>
      </CardContent>
    </Card>
  );
}

