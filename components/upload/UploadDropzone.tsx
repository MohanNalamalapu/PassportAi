"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FileImage, ImagePlus, RotateCcw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { publicEnv } from "@/lib/public-env";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/lib/templates/schema";

export type UploadedImage = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

type UploadDropzoneProps = {
  selectedTemplate: DocumentTemplate;
  uploadedImage: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
};

const acceptedTypes = ["image/jpeg", "image/png"];

export function UploadDropzone({
  selectedTemplate,
  uploadedImage,
  onImageChange
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedImage?.previewUrl) {
        URL.revokeObjectURL(uploadedImage.previewUrl);
      }
    };
  }, [uploadedImage?.previewUrl]);

  const validateAndStoreFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!acceptedTypes.includes(file.type)) {
        setError("Upload a JPEG or PNG image.");
        return;
      }

      const maxBytes = publicEnv.maxUploadMb * 1024 * 1024;

      if (file.size > maxBytes) {
        setError(`Upload a file under ${publicEnv.maxUploadMb} MB.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      try {
        const dimensions = await readImageDimensions(previewUrl);

        if (
          dimensions.width < selectedTemplate.min_width_px ||
          dimensions.height < selectedTemplate.min_height_px
        ) {
          URL.revokeObjectURL(previewUrl);
          setError(
            `Use an image at least ${selectedTemplate.min_width_px} x ${selectedTemplate.min_height_px} px for this template.`
          );
          return;
        }

        if (uploadedImage?.previewUrl) {
          URL.revokeObjectURL(uploadedImage.previewUrl);
        }

        onImageChange({
          file,
          previewUrl,
          width: dimensions.width,
          height: dimensions.height
        });
      } catch {
        URL.revokeObjectURL(previewUrl);
        setError("We could not read this image. Try another JPEG or PNG.");
      }
    },
    [onImageChange, selectedTemplate, uploadedImage?.previewUrl]
  );

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (file) {
      void validateAndStoreFile(file);
    }
  }

  function resetUpload() {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }

    onImageChange(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Upload photo</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              JPEG or PNG, up to {publicEnv.maxUploadMb} MB.
            </p>
          </div>
          <Badge variant={uploadedImage ? "success" : "secondary"}>
            {uploadedImage ? "Validated" : "Waiting"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />

        {!uploadedImage ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFiles(event.dataTransfer.files);
            }}
            className={cn(
              "flex min-h-80 w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors",
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white"
            )}
          >
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm">
              <UploadCloud className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold text-slate-950">Drop your selfie here</span>
            <span className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Or browse from your device. We validate format, size, and resolution before processing.
            </span>
            <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              Browse image
            </span>
          </button>
        ) : (
          <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <Image
                src={uploadedImage.previewUrl}
                alt="Uploaded passport photo preview"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm">
                <FileImage className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-slate-950">{uploadedImage.file.name}</p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <dt className="text-slate-500">Resolution</dt>
                  <dd className="font-medium text-slate-950">
                    {uploadedImage.width} x {uploadedImage.height} px
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <dt className="text-slate-500">File size</dt>
                  <dd className="font-medium text-slate-950">
                    {(uploadedImage.file.size / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Template</dt>
                  <dd className="text-right font-medium text-slate-950">
                    {selectedTemplate.country} {selectedTemplate.document}
                  </dd>
                </div>
              </dl>
              <Button onClick={resetUpload} variant="outline" className="mt-6 w-full">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Replace photo
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function readImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    };
    image.onerror = reject;
    image.src = src;
  });
}

