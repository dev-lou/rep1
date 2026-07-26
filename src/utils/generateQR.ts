"use client";

import QRCode from "qrcode";

export interface QROptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate a QR code as a data URL from a given string.
 * Uses the qrcode library on the client side.
 * Note: qrcode only accepts hex color values (no rgba).
 */
export async function generateQRDataURL(
  data: string,
  options: QROptions = {}
): Promise<string> {
  if (!data) {
    throw new Error("No data provided for QR code generation");
  }

  const dark = options.color?.dark || "#ffffff";
  const light = options.color?.light || "#000000";

  try {
    const url = await QRCode.toDataURL(data, {
      width: options.width || 400,
      margin: options.margin || 2,
      color: { dark, light },
      errorCorrectionLevel: "M",
    });
    return url;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to generate QR code: ${message}`);
  }
}
