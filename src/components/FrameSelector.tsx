"use client";

import { motion } from "framer-motion";
import { CONFIG } from "@/config";
import { ArrowLeftIcon } from "@/components/icons";

interface FrameSelectorProps {
  onSelect: (frameId: string) => void;
  onBack: () => void;
}

export default function FrameSelector({ onSelect, onBack }: FrameSelectorProps) {
  return (
    <div className="flex flex-col h-full w-full bg-[#faf9f6] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <h1
          className="text-xl font-black tracking-tight absolute left-1/2 -translate-x-1/2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Choose a Frame
        </h1>
        <div className="w-20" />
      </div>

      {/* Frame grid — full width, no scroll, no wasted space */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {CONFIG.frames.map((frame, i) => {
              const isCanva = frame.id.startsWith("canva_");
              const imgNum = frame.id.replace("canva_", "");
              const hasPng = isCanva && Number(imgNum) >= 1 && Number(imgNum) <= 14;

              return (
                <motion.button
                  key={frame.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelect(frame.id)}
                  className="group relative flex flex-col items-center rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] bg-white border-2 border-slate-300 hover:border-blue-500 hover:ring-4 hover:ring-blue-500/20"
                >
                  {/* Frame preview */}
                  <div className="relative w-full aspect-[1/1] sm:aspect-[4/5] bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
                    {frame.id === "none" ? (
                      <div
                        className="absolute inset-3 flex items-center justify-center rounded-xl"
                        style={{ background: "#f1f5f9", border: "2px dashed #cbd5e1" }}
                      >
                        <svg
                          className="w-10 h-10 text-slate-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    ) : hasPng ? (
                      <img
                        src={`/frames/${imgNum}.png`}
                        alt={frame.name}
                        className="absolute inset-0 w-full h-full object-contain p-2 sm:p-3"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <p className="text-xs text-slate-400">{frame.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="w-full px-1.5 sm:px-2 py-1.5 sm:py-2 text-center">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight truncate">
                      {frame.name}
                    </p>
                    {frame.id === "none" && (
                      <p className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                        No frame
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
