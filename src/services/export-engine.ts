import { loadImageFromFile, drawCroppedImage } from "@/src/lib/image-utils";
import { PDFDocument } from "pdf-lib";
import type { ExportResult } from "@/src/types/export";

export type ImageSource = File | HTMLImageElement;

/**
 * Exports a cropped image to JPEG, PNG, and PDF formats.
 */
export async function exportPassportPhoto(
  source: ImageSource,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number
): Promise<ExportResult> {
  const result: ExportResult = {};

  try {
    result.jpeg = await exportToJPEG(source, crop, outputWidth, outputHeight);
  } catch (error) {
    console.error("JPEG export failed:", error);
  }

  try {
    result.png = await exportToPNG(source, crop, outputWidth, outputHeight);
  } catch (error) {
    console.error("PNG export failed:", error);
  }

  try {
    result.pdf = await exportToPDF(source, crop, outputWidth, outputHeight);
  } catch (error) {
    console.error("PDF export failed:", error);
  }

  return result;
}

async function resolveImage(source: ImageSource): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    return source;
  }

  return loadImageFromFile(source);
}

async function exportToJPEG(
  source: ImageSource,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number
): Promise<string> {
  const image = await resolveImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context.");

  drawCroppedImage(ctx, image, crop, outputWidth, outputHeight);

  return canvas.toDataURL("image/jpeg", 0.95);
}

async function exportToPNG(
  source: ImageSource,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number
): Promise<string> {
  const image = await resolveImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context.");

  drawCroppedImage(ctx, image, crop, outputWidth, outputHeight);

  return canvas.toDataURL("image/png");
}

async function exportToPDF(
  source: ImageSource,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number
): Promise<string> {
  const image = await resolveImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context.");

  drawCroppedImage(ctx, image, crop, outputWidth, outputHeight);

  const pngDataUrl = canvas.toDataURL("image/png");
  const pngBytes = await dataURLToBytes(pngDataUrl);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([outputWidth, outputHeight]);
  const pdfImage = await pdfDoc.embedPng(pngBytes);

  page.drawImage(pdfImage, {
    x: 0,
    y: 0,
    width: outputWidth,
    height: outputHeight
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  return blobToDataUrl(blob);
}

async function dataURLToBytes(dataURL: string): Promise<Uint8Array> {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return new Uint8Array(await blob.arrayBuffer());
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to convert PDF blob to data URL."));
    reader.readAsDataURL(blob);
  });
}

export function downloadFile(dataUrl: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
