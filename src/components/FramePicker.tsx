"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from "react-konva";
import { motion } from "framer-motion";
import { CONFIG } from "@/config";
import { getLayoutPositions, formatPhotoDate } from "@/utils/composeCanvas";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, WandIcon, TypeIcon } from "@/components/icons";

const BG_COLORS = [
  { id: "white", label: "Clean White", hex: "#ffffff", hex2: "#ffffff", text: "black" },
  { id: "blue", label: "Sky Gradient", hex: "#bae6fd", hex2: "#38bdf8", text: "black" },
  { id: "red", label: "Red Gradient", hex: "#fca5a5", hex2: "#ef4444", text: "white" },
  { id: "pink", label: "Pink Gradient", hex: "#f9a8d4", hex2: "#ec4899", text: "white" },
  { id: "green", label: "Green Gradient", hex: "#86efac", hex2: "#22c55e", text: "black" },
];

interface FramePickerProps {
  photos: string[];
  layoutId: string;
  frameStyle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDone: (stageRef: React.RefObject<any>, consent: boolean) => void;
  onBack: () => void;
  onChangeFrame?: () => void;
}

function useKonvaImages(urls: string[]) {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!urls.length) return;
    let cancel = false;
    const imgs: HTMLImageElement[] = [];
    let c = 0;
    urls.forEach((url, i) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = img.onerror = () => {
        if (cancel) return;
        imgs[i] = img;
        if (++c === urls.length) {
          setImages([...imgs]);
          setLoaded(true);
        }
      };
      img.src = url;
    });
    return () => {
      cancel = true;
    };
  }, [urls]);
  return { images, loaded };
}

export default function FramePicker({
  photos,
  layoutId,
  frameStyle,
  onDone,
  onBack,
  onChangeFrame,
}: FramePickerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  // Use prop as initial frame, else default to first canva frame or "none"
  const [currentFrame, setCurrentFrame] = useState(frameStyle || CONFIG.frames[1]?.id || "none");
  const [showDate, setShowDate] = useState(false);
  const [bwFilter, setBwFilter] = useState(false);
  const [showEventText, setShowEventText] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const { images, loaded } = useKonvaImages(photos);

  const isCanvaFrame = currentFrame.startsWith("canva_");
  const isTextFrame = ["canva_4", "canva_5", "canva_6", "canva_7"].includes(currentFrame);
  const isCanvaOverlay = isCanvaFrame && !isTextFrame;
  const isCanvaBackground = isCanvaFrame && isTextFrame;

  const canvaUrl = isCanvaFrame ? `/frames/${currentFrame.replace("canva_", "")}.png` : "";
  const { images: frameImages, loaded: frameLoaded } = useKonvaImages(canvaUrl ? [canvaUrl] : []);
  const customFrameImg = frameImages[0];

  const { images: logoImages } = useKonvaImages(["/logo.png"]);
  const logoImg = logoImages[0];

  // Background images are no longer used, using native Konva gradients
  const allLoaded = loaded && (!isCanvaFrame || frameLoaded);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxW = rect.width;
      const maxH = window.innerHeight * 0.85; // Give it more height in split screen

      let asp = 3 / 4;
      if (layoutId === "strip") asp = 1 / 2.18;
      else if (layoutId === "grid")
        asp = 1 / 1.07; // Almost perfect square (1:1) for optimal digital/Instagram grids
      else if (layoutId === "polaroid") asp = 4 / 5.2;
      else if (layoutId === "single") asp = 1 / 1.4;

      let w = maxW;
      let h = w / asp;

      if (h > maxH) {
        h = maxH;
        w = h * asp;
      }

      setDims({ w, h });
    };

    // small timeout to ensure flex layout is painted
    setTimeout(update, 50);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [layoutId]);

  const handleDone = useCallback(
    (consent: boolean) => {
      if (stageRef.current) onDone(stageRef, consent);
    },
    [onDone],
  );
  const positions = getLayoutPositions(layoutId, dims.w, dims.h);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#faf9f6] overflow-hidden">
      {/* LEFT: Preview Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative min-w-0 h-full">
        <motion.div
          className="w-full h-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            {!allLoaded ? (
              <div
                className="flex items-center justify-center"
                style={{ width: dims.w, height: dims.h }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="spinner" />
                  <p className="text-xs text-slate-400">Loading photos...</p>
                </div>
              </div>
            ) : (
              <div
                className="shadow-2xl shadow-black/10 rounded-xl overflow-hidden"
                style={{ width: dims.w, height: dims.h }}
              >
                <Stage ref={stageRef} width={dims.w} height={dims.h} pixelRatio={1}>
                  <Layer>
                    <Rect
                      x={0}
                      y={0}
                      width={dims.w}
                      height={dims.h}
                      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                      fillLinearGradientEndPoint={{ x: dims.w, y: dims.h }}
                      fillLinearGradientColorStops={[
                        0,
                        bgColor.hex,
                        1,
                        bgColor.hex2 || bgColor.hex,
                      ]}
                    />

                    {/* Canva Frame Background */}
                    {isCanvaBackground && customFrameImg && (
                      <KonvaImage
                        image={customFrameImg}
                        x={0}
                        y={0}
                        width={dims.w}
                        height={dims.h}
                      />
                    )}

                    {images.map((img, i) => {
                      const pos = positions[i];
                      if (!pos || !img) return null;
                      const ia = img.width / img.height;
                      const ba = pos.width / pos.height;
                      let cw: number, ch: number;
                      if (ia > ba) {
                        ch = img.height;
                        cw = ch * ba;
                      } else {
                        cw = img.width;
                        ch = cw / ba;
                      }

                      // Modern, responsive border radius
                      const radius = Math.max(8, dims.w * 0.025);

                      return (
                        <Group key={i} x={pos.x} y={pos.y} width={pos.width} height={pos.height}>
                          <KonvaImage
                            image={img}
                            width={pos.width}
                            height={pos.height}
                            crop={{
                              x: (img.width - cw) / 2,
                              y: (img.height - ch) / 2,
                              width: cw,
                              height: ch,
                            }}
                            cornerRadius={radius}
                          />
                          {bwFilter && (
                            <Rect
                              width={pos.width}
                              height={pos.height}
                              fill="black"
                              globalCompositeOperation="saturation"
                              cornerRadius={radius}
                            />
                          )}
                        </Group>
                      );
                    })}

                    {/* Polaroid specific bottom area (Removed, now part of full card) */}

                    {/* Logo Area (Removed by request) */}

                    {/* Canva Frame Overlay */}
                    {isCanvaOverlay && customFrameImg && (
                      <KonvaImage
                        image={customFrameImg}
                        x={0}
                        y={0}
                        width={dims.w}
                        height={dims.h}
                      />
                    )}

                    {/* Date */}
                    {showDate && (
                      <Text
                        x={dims.w * 0.05}
                        y={dims.h - dims.h * 0.04}
                        text={formatPhotoDate()}
                        fontSize={dims.w * 0.035}
                        fill="#000000"
                        fontStyle="bold"
                        fontFamily="var(--font-heading)"
                        stroke="#000000"
                        strokeWidth={1}
                      />
                    )}

                    {/* Event Text */}
                    {showEventText &&
                      (() => {
                        // Reduced the scale on the strip so it has plenty of margin on the left and right!
                        const fScale = layoutId === "strip" ? 0.058 : 0.045;
                        const fSize = dims.w * fScale;

                        // Increased the multiplier so the pill has more breathing room around the text
                        const pWidth = fSize * 15;
                        const pHeight = fSize * 1.8;

                        return (
                          <Group
                            y={
                              layoutId === "polaroid"
                                ? dims.h - dims.h * 0.14
                                : dims.h - dims.h * 0.08
                            }
                          >
                            {/* Translucent Pill Backdrop */}
                            <Rect
                              x={(dims.w - pWidth) / 2}
                              y={-pHeight * 0.25}
                              width={pWidth}
                              height={pHeight}
                              fill="rgba(255, 255, 255, 0.95)"
                              cornerRadius={pHeight / 2}
                              shadowColor="rgba(0,0,0,0.08)"
                              shadowBlur={3}
                              shadowOffsetY={1}
                            />
                            <Text
                              x={0}
                              y={0}
                              width={dims.w}
                              text="FIRST DAY OF SCHOOL!"
                              fontSize={fSize}
                              fillLinearGradientStartPoint={{ x: (dims.w - pWidth) / 2, y: 0 }}
                              fillLinearGradientEndPoint={{ x: (dims.w + pWidth) / 2, y: 0 }}
                              fillLinearGradientColorStops={[
                                0,
                                "#0284c7",
                                0.5,
                                "#10b981",
                                1,
                                "#0284c7",
                              ]}
                              fontStyle="bold"
                              align="center"
                              fontFamily="'Montserrat', 'Poppins', sans-serif"
                            />
                          </Group>
                        );
                      })()}

                    {/* Watermark Logo */}
                    {logoImg &&
                      (() => {
                        const logoSize = Math.max(50, dims.w * 0.12);
                        const logoMarginX = Math.max(12, dims.w * 0.04);

                        // Push it slightly higher on polaroid so it aligns nicely with the bottom white block
                        const yPos =
                          layoutId === "polaroid"
                            ? dims.h - dims.h * 0.11 - logoSize / 2
                            : dims.h - logoSize - Math.max(12, dims.w * 0.04);

                        return (
                          <Group
                            x={dims.w - logoSize - logoMarginX}
                            y={yPos}
                            opacity={1} // Fully visible
                          >
                            <KonvaImage
                              image={logoImg}
                              width={logoSize}
                              height={logoSize}
                              cornerRadius={logoSize / 2} // Perfectly clips the square background into a circle!
                              shadowColor="rgba(0,0,0,0.15)"
                              shadowBlur={3}
                              shadowOffsetY={1}
                            />
                          </Group>
                        );
                      })()}
                  </Layer>
                </Stage>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Controls Panel */}
      <div className="w-full lg:w-[380px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-2xl flex flex-col h-auto lg:h-full z-10">
        <div className="p-6 lg:p-8 pb-4 border-b border-slate-100">
          <h2
            className="text-2xl font-black tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Customize
          </h2>
          <p className="mt-1 text-sm text-slate-500">Design your perfect photo strip</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5 pb-24">
          {/* Background Color */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Background Color
            </h3>
            <div className="flex flex-wrap gap-4">
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBgColor(bg)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-cover bg-center ${
                    bgColor.id === bg.id
                      ? "ring-4 ring-blue-500 ring-offset-2 scale-110"
                      : "hover:scale-105 border border-slate-200 shadow-sm"
                  }`}
                  style={{ backgroundColor: bg.hex }}
                  title={bg.label}
                >
                  {bgColor.id === bg.id && (
                    <CheckIcon
                      className={`w-5 h-5 ${bg.text === "white" ? "text-white" : "text-slate-800"}`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Frame */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Frame
            </h3>
            <div
              className="text-sm font-bold text-slate-700 px-3 py-2.5 rounded-lg mb-2"
              style={{ background: "rgba(0,0,0,0.03)" }}
            >
              {CONFIG.frames.find((f) => f.id === currentFrame)?.name || "None"}
            </div>
            {onChangeFrame && (
              <button
                onClick={onChangeFrame}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all border-2 border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Change Frame
              </button>
            )}
          </div>

          {/* Extras */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Extras
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowDate((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 w-full ${
                  showDate
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
                {showDate ? "Date Stamp Enabled" : "Add Date Stamp"}
              </button>

              <button
                onClick={() => setBwFilter((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 w-full ${
                  bwFilter
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                }`}
              >
                <WandIcon className="w-5 h-5" />
                {bwFilter ? "B&W Filter Enabled" : "Add B&W Filter"}
              </button>

              <button
                onClick={() => setShowEventText((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 w-full ${
                  showEventText
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                }`}
              >
                <TypeIcon className="w-5 h-5" />
                {showEventText ? "Event Text Enabled" : "Add Event Text"}
              </button>
            </div>
          </div>
        </div>{" "}
        {/* Action Buttons */}
        <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!allLoaded}
            className="btn-accent w-full py-4 text-lg font-bold rounded-xl shadow-lg shadow-blue-500/25"
          >
            Done
          </button>
          <button
            onClick={onBack}
            className="w-full py-4 text-base font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Retake Photos
          </button>
        </div>
      </div>

      {/* Consent Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Post this online?</h3>
              <p className="text-slate-500 text-sm mb-6">
                We may feature your photo on our Facebook page for the event!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDone(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Yes, post it!
                </button>
                <button
                  onClick={() => handleDone(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No, keep private
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
