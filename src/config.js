/**
 * PhotoBooth Configuration
 * Edit this file to customize your booth experience.
 */

export const CONFIG = {
  // Booth identity
  boothName: "Snap IT",
  boothTagline: "Capture the Moment",

  // Cloudinary (get these from your Cloudinary dashboard)
  cloudinaryCloudName: "zlxsnd69",
  cloudinaryUploadPreset: "photobooth",

  // Brand accent color (any valid CSS color)
  accentColor: "#3b82f6", // Blue
  accentGradient: "from-blue-500 via-sky-500 to-cyan-500",

  // Timing
  autoResetSeconds: 30,
  countdownSeconds: 3,
  flashDurationMs: 300,

  // Features
  showDateOnPhoto: true,
  enableSoundEffects: true,

  // Layout options
  layouts: [
    {
      id: "strip",
      name: "Classic Strip",
      description: "3 photos in a vertical strip",
      shots: 3,
      icon: "strip",
    },
    {
      id: "grid",
      name: "2×2 Grid",
      description: "4 photos in a square grid",
      shots: 4,
      icon: "grid",
    },
    {
      id: "single",
      name: "Single Shot",
      description: "One perfect shot with border",
      shots: 1,
      icon: "single",
    },
    {
      id: "polaroid",
      name: "Polaroid",
      description: "Classic instant photo style",
      shots: 1,
      icon: "polaroid",
    },
  ],

  // Frame styles available
  frames: [
    { id: "none", name: "None" },
    // --- ROW 1 ---
    { id: "canva_1", name: "Frame 1" }, // Robot
    { id: "canva_2", name: "Frame 2" }, // Blue Flowers
    { id: "canva_8", name: "Frame 3" }, // AY 2026-2027
    { id: "canva_4", name: "Frame 4" }, // Freshmen (Moved up to sit above Junior)
    { id: "canva_5", name: "Frame 5" }, // Sophomore (Moved up to sit above Senior)
    // --- ROW 2 ---
    { id: "canva_11", name: "Frame 6" }, // Bright Ideas
    { id: "canva_12", name: "Frame 7" }, // Watercolor Garden
    { id: "canva_9", name: "Frame 8" }, // Gradient Corner
    { id: "canva_10", name: "Frame 9" }, // School Supplies
    { id: "canva_6", name: "Frame 10" }, // Junior
    { id: "canva_7", name: "Frame 11" }, // Senior
  ],
};
