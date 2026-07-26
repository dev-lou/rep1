"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Star, Line, Circle, Path, Group } from "react-konva";
import { motion } from "framer-motion";
import { CONFIG } from "@/config";
import { getLayoutPositions, formatPhotoDate } from "@/utils/composeCanvas";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, WandIcon, TypeIcon } from "@/components/icons";

const BG_COLORS = [
  { id: "blue", label: "Sky Gradient", hex: "#bae6fd", hex2: "#38bdf8", text: "black" },
  { id: "pink", label: "Pink Gradient", hex: "#f9a8d4", hex2: "#ec4899", text: "white" },
  { id: "red", label: "Red Gradient", hex: "#fca5a5", hex2: "#ef4444", text: "white" },
  { id: "green", label: "Green Gradient", hex: "#86efac", hex2: "#22c55e", text: "black" },
  { id: "white", label: "Clean White", hex: "#ffffff", hex2: "#ffffff", text: "black" },
];

interface FramePickerProps {
  photos: string[];
  layoutId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDone: (stageRef: React.RefObject<any>) => void;
  onBack: () => void;
}

function getFrameOverlay(frameStyle: string, w: number, h: number) {
  const m = w * 0.02;
  const ICON_SCALE = 1.5;
  const iconM = m + 10;
  
  switch (frameStyle) {
    case "classic":
      return (
        <>
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke="#ffffff" strokeWidth={4} />
          {/* Floral/Leaf SVGs in corners */}
          <Path x={iconM} y={iconM} data="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="#fff" scale={{x: ICON_SCALE, y: ICON_SCALE}} />
          <Path x={w - iconM - 24*ICON_SCALE} y={iconM} data="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="#fff" scale={{x: -ICON_SCALE, y: ICON_SCALE}} offsetX={24} />
        </>
      );
    case "vintage_film":
      return (
        <>
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke="#333" strokeWidth={2} />
          {Array.from({ length: Math.floor(h / 25) }).map((_, i) => (
            <Rect key={`l-${i}`} x={m + 4} y={m + 8 + i * 25} width={4} height={12} fill="#111" cornerRadius={1} />
          ))}
          {Array.from({ length: Math.floor(h / 25) }).map((_, i) => (
            <Rect key={`r-${i}`} x={w - m - 8} y={m + 8 + i * 25} width={4} height={12} fill="#111" cornerRadius={1} />
          ))}
          {/* Camera SVG */}
          <Path x={w/2 - (24*ICON_SCALE)/2} y={iconM} data="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z M12 13a3 3 0 100-6 3 3 0 000 6z" stroke="#333" strokeWidth={2} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
        </>
      );
    case "minimal": // Decorated with School SVGs
      return (
        <>
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke="#334155" strokeWidth={1.5} />
          {/* Pencil SVG */}
          <Path x={iconM} y={iconM} data="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#334155" strokeWidth={2} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
          {/* Book SVG */}
          <Path x={w - iconM - 24*ICON_SCALE} y={iconM} data="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="#334155" strokeWidth={2} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
        </>
      );
    case "neon":
      return (
        <>
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke={CONFIG.accentColor} strokeWidth={3} cornerRadius={14} shadowColor={CONFIG.accentColor} shadowBlur={20} shadowOpacity={0.8} />
          {/* Lightning SVGs */}
          <Path x={iconM} y={iconM} data="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={CONFIG.accentColor} shadowColor={CONFIG.accentColor} shadowBlur={15} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
          <Path x={w - iconM - 24*ICON_SCALE} y={iconM} data="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={CONFIG.accentColor} shadowColor={CONFIG.accentColor} shadowBlur={15} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
        </>
      );
    case "varsity":
      return (
        <>
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke="#1e3a8a" strokeWidth={6} cornerRadius={4} />
          <Rect x={m+8} y={m+8} width={w - m*2 - 16} height={h - m*2 - 16} stroke="#fbbf24" strokeWidth={2} />
          {/* Trophy SVG */}
          <Path x={w/2 - (24*ICON_SCALE)/2} y={iconM} data="M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z" stroke="#fbbf24" strokeWidth={2} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
        </>
      );
    case "polaroid_stack":
      return (
        <>
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke="rgba(255,255,255,0.8)" strokeWidth={8} shadowColor="#000" shadowBlur={10} shadowOpacity={0.2} shadowOffset={{x: 2, y: 4}} />
          {/* Heart SVG */}
          <Path x={w - iconM - 24*ICON_SCALE} y={iconM} data="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="#ef4444" shadowColor="#ef4444" shadowBlur={4} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
        </>
      );
    case "cyber":
      return (
        <>
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke="#06b6d4" strokeWidth={2} />
          {/* CPU SVG */}
          <Path x={iconM} y={iconM} data="M18 10V8h2V6h-2V4a2 2 0 0 0-2-2h-2V0h-2v2h-4V0H8v2H6a2 2 0 0 0-2 2v2H2v2h2v2H2v2h2v2a2 2 0 0 0 2 2h2v2h2v-2h4v2h2v-2h2a2 2 0 0 0 2-2v-2h2v-2h-2v-2h2v-2h-2zM6 18V6h12v12H6z" fill="#22d3ee" scale={{x: ICON_SCALE, y: ICON_SCALE}} />
          {/* Laptop SVG */}
          <Path x={w - iconM - 24*ICON_SCALE} y={h - iconM - 24*ICON_SCALE} data="M20 16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 01-.9 1.45H3.62a1 1 0 01-.9-1.45L4 16" stroke="#22d3ee" strokeWidth={2} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
        </>
      );
    case "hacker":
      return (
        <>
          {/* Terminal Window Border */}
          <Rect x={m} y={m} width={w - m*2} height={h - m*2} stroke="#333" strokeWidth={2} cornerRadius={6} />
          <Rect x={m} y={m} width={w - m*2} height={20} fill="#1a1a1a" cornerRadius={[6,6,0,0]} />
          {/* Mac Buttons */}
          <Circle x={m+12} y={m+10} radius={4} fill="#ef4444" />
          <Circle x={m+24} y={m+10} radius={4} fill="#f59e0b" />
          <Circle x={m+36} y={m+10} radius={4} fill="#22c55e" />
          {/* Database/Server SVG */}
          <Path x={w - iconM - 24*ICON_SCALE} y={iconM + 20} data="M4 6a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 9a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3z" stroke="#22c55e" strokeWidth={2} scale={{x: ICON_SCALE, y: ICON_SCALE}} />
          {/* Syntax accents */}
          <Text x={iconM} y={h - iconM - 20} text="</>" fill="#22c55e" fontSize={18} fontFamily="monospace" fontStyle="bold" />
        </>
      );
    default: return null;
  }
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
        if (++c === urls.length) { setImages([...imgs]); setLoaded(true); }
      };
      img.src = url;
    });
    return () => { cancel = true; };
  }, [urls]);
  return { images, loaded };
}

export default function FramePicker({ photos, layoutId, onDone, onBack }: FramePickerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [frameStyle, setFrameStyle] = useState(CONFIG.frames[1]?.id || "none");
  const [showDate, setShowDate] = useState(true);
  const [bwFilter, setBwFilter] = useState(false);
  const [showEventText, setShowEventText] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const { images, loaded } = useKonvaImages(photos);
  
  const isCanvaFrame = frameStyle.startsWith("canva_");
  const isCanvaOverlay = ['canva_1', 'canva_2'].includes(frameStyle);
  const isCanvaBackground = isCanvaFrame && !isCanvaOverlay;
  
  const canvaUrl = isCanvaFrame ? `/frames/${frameStyle.replace('canva_', '')}.png` : "";
  const { images: frameImages, loaded: frameLoaded } = useKonvaImages(canvaUrl ? [canvaUrl] : []);
  const customFrameImg = frameImages[0];

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
      else if (layoutId === "grid") asp = 1 / 1.07; 
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

  const handleDone = useCallback(() => { if (stageRef.current) onDone(stageRef); }, [onDone]);
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
              <div className="flex items-center justify-center" style={{ width: dims.w, height: dims.h }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="spinner" />
                  <p className="text-xs text-slate-400">Loading photos...</p>
                </div>
              </div>
            ) : (
              <div className="shadow-2xl shadow-black/10 rounded-xl overflow-hidden" style={{ width: dims.w, height: dims.h }}>
                <Stage ref={stageRef} width={dims.w} height={dims.h} pixelRatio={1}>
                  <Layer>
                    <Rect 
                      x={0} y={0} width={dims.w} height={dims.h} 
                      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                      fillLinearGradientEndPoint={{ x: dims.w, y: dims.h }}
                      fillLinearGradientColorStops={[0, bgColor.hex, 1, bgColor.hex2 || bgColor.hex]}
                    />
                    
                    {/* Canva Frame Background */}
                    {isCanvaBackground && customFrameImg && (
                      <KonvaImage image={customFrameImg} x={0} y={0} width={dims.w} height={dims.h} />
                    )}
                    
                    {images.map((img, i) => {
                      const pos = positions[i];
                      if (!pos || !img) return null;
                      const ia = img.width / img.height;
                      const ba = pos.width / pos.height;
                      let cw: number, ch: number;
                      if (ia > ba) { ch = img.height; cw = ch * ba; }
                      else { cw = img.width; ch = cw / ba; }
                      
                      // Modern, responsive border radius
                      const radius = Math.max(8, dims.w * 0.025);
                      
                      return (
                        <Group key={i} x={pos.x} y={pos.y} width={pos.width} height={pos.height}>
                          <KonvaImage image={img} width={pos.width} height={pos.height}
                            crop={{ x: (img.width - cw)/2, y: (img.height - ch)/2, width: cw, height: ch }}
                            cornerRadius={radius}
                          />
                          {bwFilter && (
                            <Rect width={pos.width} height={pos.height} fill="black" globalCompositeOperation="saturation" cornerRadius={radius} />
                          )}
                        </Group>
                      );
                    })}
                    
                    {/* Polaroid specific bottom area (Removed, now part of full card) */}

                    {/* Logo Area (Removed by request) */}

                    {/* Vector Frame Overlay (only if not a Canva frame) */}
                    {!isCanvaFrame && getFrameOverlay(frameStyle, dims.w, dims.h)}
                    
                    {/* Canva Frame Overlay */}
                    {isCanvaOverlay && customFrameImg && (
                      <KonvaImage image={customFrameImg} x={0} y={0} width={dims.w} height={dims.h} />
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
                    {showEventText && (() => {
                      // Reduced the scale on the strip so it has plenty of margin on the left and right!
                      const fScale = layoutId === 'strip' ? 0.058 : 0.045;
                      const fSize = dims.w * fScale;
                      
                      // Increased the multiplier so the pill has more breathing room around the text
                      const pWidth = fSize * 15; 
                      const pHeight = fSize * 1.8;
                      
                      return (
                        <Group y={layoutId === 'polaroid' ? dims.h - dims.h * 0.14 : dims.h - dims.h * 0.08}>
                          {/* Translucent Pill Backdrop */}
                          <Rect 
                            x={(dims.w - pWidth) / 2}
                            y={-pHeight * 0.25}
                            width={pWidth}
                            height={pHeight}
                            fill="rgba(255, 255, 255, 0.95)"
                            cornerRadius={pHeight / 2}
                            shadowColor="rgba(0,0,0,0.1)"
                            shadowBlur={8}
                            shadowOffsetY={3}
                          />
                          <Text 
                            x={0} 
                            y={0}
                            width={dims.w}
                            text="FIRST DAY OF SCHOOL!" 
                            fontSize={fSize}
                            fillLinearGradientStartPoint={{ x: (dims.w - pWidth) / 2, y: 0 }}
                            fillLinearGradientEndPoint={{ x: (dims.w + pWidth) / 2, y: 0 }}
                            fillLinearGradientColorStops={[0, '#0284c7', 0.5, '#10b981', 1, '#0284c7']}
                            fontStyle="bold"
                            align="center"
                            fontFamily="'Montserrat', 'Poppins', sans-serif" 
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
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Customize</h2>
          <p className="mt-1 text-sm text-slate-500">Design your perfect photo strip</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5 pb-24">
          
          {/* Frame Style */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Frame Style</h3>
            <div className="grid grid-cols-2 gap-2">
              {CONFIG.frames.map((f) => (
                <button 
                  key={f.id} 
                  onClick={() => setFrameStyle(f.id)}
                  className={`py-2 px-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                    frameStyle === f.id 
                      ? "border-blue-500 bg-blue-50 text-blue-700" 
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Background Color</h3>
            <div className="flex flex-wrap gap-4">
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBgColor(bg)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-cover bg-center ${
                    bgColor.id === bg.id ? "ring-4 ring-blue-500 ring-offset-2 scale-110" : "hover:scale-105 border border-slate-200 shadow-sm"
                  }`}
                  style={{ backgroundColor: bg.hex }}
                  title={bg.label}
                >
                  {bgColor.id === bg.id && <CheckIcon className={`w-5 h-5 ${bg.text === "white" ? "text-white" : "text-slate-800"}`} />}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Extras</h3>
             <div className="flex flex-col gap-2">
               <button onClick={() => setShowDate((p) => !p)}
                 className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 w-full ${
                   showDate ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                 }`}
               >
                 <CalendarIcon className="w-5 h-5" />
                 {showDate ? "Date Stamp Enabled" : "Add Date Stamp"}
               </button>
               
               <button onClick={() => setBwFilter((p) => !p)}
                 className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 w-full ${
                   bwFilter ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                 }`}
               >
                 <WandIcon className="w-5 h-5" />
                 {bwFilter ? "B&W Filter Enabled" : "Add B&W Filter"}
               </button>

               <button onClick={() => setShowEventText((p) => !p)}
                 className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 w-full ${
                   showEventText ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                 }`}
               >
                 <TypeIcon className="w-5 h-5" />
                 {showEventText ? "Event Text Enabled" : "Add Event Text"}
               </button>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          <button onClick={() => setShowConfirm(true)} disabled={!allLoaded} className="btn-accent w-full py-4 text-lg font-bold rounded-xl shadow-lg shadow-blue-500/25">
            Done
          </button>
          <button onClick={onBack} className="w-full py-4 text-base font-bold text-slate-500 hover:text-slate-800 transition-colors">
            Retake Photo
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to finalize?</h3>
              <p className="text-slate-500 text-sm mb-6">Make sure your design is perfect! You won't be able to edit these settings after proceeding.</p>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleDone}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  Yes, looks great!
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                >
                  Wait, let me check
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
