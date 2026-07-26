"use client";

/**
 * Flatten a Konva stage node to a PNG blob.
 * Uses Konva's native toBlob() for direct canvas export — no slow base64 encoding.
 */
export function stageToBlob(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stageRef: React.RefObject<any>,
): Promise<Blob | null> {
  if (!stageRef.current) {
    return Promise.reject(new Error("Stage reference is not available"));
  }

  // Use Konva's native toBlob — directly exports canvas to PNG blob
  // Much faster than toDataURL + fetch(dataURL).blob()
  return stageRef.current.toBlob({
    pixelRatio: 1.5, // High quality — balanced for performance on low-end laptops
    mimeType: "image/png",
  });
}

/**
 * Calculate the layout dimensions and positions for photos
 * based on the chosen layout template.
 */
export function getLayoutPositions(
  layoutId: string,
  canvasWidth: number,
  canvasHeight: number,
): Array<{ x: number; y: number; width: number; height: number }> {
  const margin = canvasWidth * 0.04;
  const isPolaroid = layoutId === "polaroid";
  const logoMargin = isPolaroid ? canvasHeight * 0.18 : canvasHeight * 0.1;
  const usableWidth = canvasWidth - margin * 2;
  const usableHeight = canvasHeight - margin - logoMargin;

  switch (layoutId) {
    case "strip": {
      // 3 photos stacked vertically
      const photoHeight = (usableHeight - margin * 2) / 3;
      return [0, 1, 2].map((i) => ({
        x: margin,
        y: margin + i * (photoHeight + margin),
        width: usableWidth,
        height: photoHeight,
      }));
    }

    case "grid": {
      // 2x2 grid
      const cellSize = (usableWidth - margin) / 2;
      const gridHeight = cellSize * 2 + margin;
      const offsetY = (usableHeight - gridHeight) / 2;
      return [0, 1, 2, 3].map((i) => ({
        x: margin + (i % 2) * (cellSize + margin),
        y: margin + offsetY + Math.floor(i / 2) * (cellSize + margin),
        width: cellSize,
        height: cellSize,
      }));
    }

    case "single": {
      // Single large photo filling the usable area
      return [
        {
          x: margin,
          y: margin,
          width: usableWidth,
          height: usableHeight,
        },
      ];
    }

    case "polaroid": {
      // Single photo with space at bottom for the "Polaroid tail"
      const photoWidth = usableWidth * 0.85;
      const photoHeight = photoWidth; // Classic polaroids are perfect squares!
      const photoX = (canvasWidth - photoWidth) / 2;
      const photoY = margin + (canvasHeight - logoMargin - margin * 2 - photoHeight) / 2;
      return [
        {
          x: photoX,
          y: photoY,
          width: photoWidth,
          height: photoHeight,
        },
      ];
    }

    default:
      return [];
  }
}

/**
 * Format a date for display on the photo.
 */
export function formatPhotoDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("en-US", options);
}
