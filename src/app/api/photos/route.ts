import { NextResponse } from "next/server";

/**
 * GET /api/photos
 *
 * Lists all images uploaded to Cloudinary for the photo booth.
 * Uses Cloudinary Admin API (requires API Key + Secret — set in config.js).
 * Returns JSON array of photo objects with URL, dimensions, and timestamps.
 */

// Cloudinary Admin API base
const CLOUDINARY_API_BASE = "https://api.cloudinary.com/v1_1";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
  bytes: number;
  tags?: string[];
}

interface CloudinaryListResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  rate_limit_allowed?: number;
  rate_limit_remaining?: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;
  const maxResults = Math.min(Number(searchParams.get("max") || "50"), 100);
  const consentFilter = searchParams.get("consent"); // "yes" | "no" | null

  // Load credentials from server-side env or config
  // These should NOT be exposed to the client
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error: true,
        message:
          "Cloudinary API credentials not configured. Add them to your .env.local file:\n" +
          "CLOUDINARY_CLOUD_NAME=your_cloud_name\n" +
          "CLOUDINARY_API_KEY=your_api_key\n" +
          "CLOUDINARY_API_SECRET=your_api_secret",
      },
      { status: 503 },
    );
  }

  // Build the auth header (Basic Auth with API Key:API Secret)
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const params = new URLSearchParams({
      max_results: String(maxResults),
      sort_by: "created_at",
      direction: "desc",
      asset_folder: "photobooth",
      tags: "true",
    });
    if (cursor) params.set("next_cursor", cursor);

    const res = await fetch(
      `${CLOUDINARY_API_BASE}/${cloudName}/resources/by_asset_folder?${params}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudinary API error:", res.status, errorText);
      return NextResponse.json(
        {
          error: true,
          message: `Cloudinary API returned ${res.status}. Check your API credentials.`,
        },
        { status: 502 },
      );
    }

    const data: CloudinaryListResponse = await res.json();

    // Map to a clean response format
    let photos = data.resources.map((r) => ({
      id: r.public_id,
      url: r.secure_url,
      width: r.width,
      height: r.height,
      format: r.format,
      createdAt: r.created_at,
      sizeKB: Math.round(r.bytes / 1024),
      tags: r.tags || [],
      // Generate 4×6 print URL using Cloudinary transformations
      printUrl: `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_1800,h_1200,b_white/${r.public_id}.${r.format}`,
      thumbnailUrl: `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_400,h_300/${r.public_id}.${r.format}`,
    }));

    // Filter by consent if requested
    if (consentFilter === "yes") {
      photos = photos.filter((p) => p.tags.includes("consent_yes"));
    } else if (consentFilter === "no") {
      photos = photos.filter((p) => p.tags.includes("consent_no"));
    }

    return NextResponse.json({
      photos,
      total: photos.length,
      nextCursor: data.next_cursor || null,
    });
  } catch (err) {
    console.error("Failed to fetch Cloudinary resources:", err);
    return NextResponse.json(
      {
        error: true,
        message: "Failed to connect to Cloudinary. Check your network and credentials.",
      },
      { status: 500 },
    );
  }
}
