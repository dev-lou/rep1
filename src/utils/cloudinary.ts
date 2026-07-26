"use client";

import { CONFIG } from "@/config";

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export interface UploadError {
  message: string;
  status?: number;
  retryable: boolean;
}

/**
 * Upload an image blob to Cloudinary using unsigned upload.
 * No backend needed — works directly from the browser.
 * @param tags Optional array of tags to apply to the image on upload.
 */
export async function uploadToCloudinary(blob: Blob, tags?: string[]): Promise<UploadResult> {
  const { cloudinaryCloudName, cloudinaryUploadPreset } = CONFIG;

  if (!cloudinaryCloudName || cloudinaryCloudName === "YOUR_CLOUD_NAME") {
    throw {
      message:
        "Cloudinary cloud name not configured. Update src/config.js with your Cloudinary details.",
      retryable: false,
    } as UploadError;
  }

  if (!cloudinaryUploadPreset || cloudinaryUploadPreset === "YOUR_UPLOAD_PRESET") {
    throw {
      message:
        "Cloudinary upload preset not configured. Update src/config.js with your upload preset.",
      retryable: false,
    } as UploadError;
  }

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", cloudinaryUploadPreset);

  if (tags && tags.length > 0) {
    formData.append("tags", tags.join(","));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorBody = await res.text();
      let message = `Upload failed with status ${res.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        message = parsed.error?.message || message;
      } catch {}

      throw {
        message,
        status: res.status,
        retryable: res.status >= 500 || res.status === 429,
      } as UploadError;
    }

    const data = await res.json();

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === "AbortError") {
      throw {
        message: "Upload timed out. Please check your connection and try again.",
        retryable: true,
      } as UploadError;
    }

    // Re-throw if already formatted
    if (err && typeof err === "object" && "retryable" in err) {
      throw err;
    }

    throw {
      message: "Network error. Please check your connection.",
      retryable: true,
    } as UploadError;
  }
}
