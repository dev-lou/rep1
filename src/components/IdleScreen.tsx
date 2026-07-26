"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CONFIG } from "@/config";
import { CameraIcon, SparkleIcon, ArrowRightIcon } from "@/components/icons";

interface IdleScreenProps {
  onStart: () => void;
}

export default function IdleScreen({ onStart }: IdleScreenProps) {
  // No pulse state needed — handled by CSS animation on the button

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onStart();
      }
    },
    [onStart],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-8 overflow-hidden">
      {/* Floating decorative shapes */}
      <div
        className="floating-shape floating-shape-1"
        style={{ background: `radial-gradient(circle, ${CONFIG.accentColor}22, transparent)` }}
      />
      <div
        className="floating-shape floating-shape-2"
        style={{ background: `radial-gradient(circle, ${CONFIG.accentColor}18, transparent)` }}
      />
      <div
        className="floating-shape floating-shape-3"
        style={{ background: `radial-gradient(circle, ${CONFIG.accentColor}15, transparent)` }}
      />

      {/* Brand + CTA */}
      <motion.div
        className="flex flex-col items-center gap-8 z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Icon — CSS GPU-accelerated float */}
        <div className="relative idle-float">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center badge-glass">
            <CameraIcon className="w-11 h-11" style={{ color: "#2563eb" }} />{" "}
          </div>
        </div>

        {/* Name + tagline */}
        <div className="text-center space-y-4">
          <h1
            className="text-7xl md:text-9xl font-black tracking-tighter flex items-center justify-center gap-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-gradient text-glow">Snap</span>
            <span
              className="text-transparent bg-clip-text drop-shadow-xl"
              style={{
                // Premium metallic red gradient with a sleek glass reflection line
                backgroundImage:
                  "linear-gradient(135deg, #ef4444 0%, #b91c1c 40%, #fca5a5 50%, #b91c1c 60%, #7f1d1d 100%)",
                filter: "drop-shadow(0 4px 20px rgba(239,68,68,0.6))",
              }}
            >
              IT
            </span>
          </h1>
          <p className="subtitle-premium text-base md:text-lg">{CONFIG.boothTagline}</p>
        </div>
      </motion.div>

      {/* Start button */}
      <motion.div
        className="z-10 mt-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={onStart}
          className="btn-accent text-2xl px-16 py-6 rounded-2xl gap-4 font-bold idle-pulse-btn"
          style={
            {
              "--pulse-accent": CONFIG.accentColor,
            } as React.CSSProperties
          }
        >
          <SparkleIcon className="w-6 h-6" />
          <span>Start</span>
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Credits */}
      <motion.div
        className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1, delay: 1 }}
        whileHover={{ opacity: 1 }}
      >
        <p>
          Developed by <span className="font-bold text-slate-600">Lou Vincent Baroro</span>
        </p>
        <p className="text-[9px] sm:text-[10px] mt-0.5">CTO of Syntaxure Labs</p>
      </motion.div>

      {/* CICT Logo */}
      <motion.div
        className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 opacity-80 hover:opacity-100 transition-opacity"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <img
          src="/logo.png"
          alt="CICT Logo"
          className="w-16 h-16 lg:w-24 lg:h-24 rounded-full shadow-xl ring-4 ring-white/50"
        />
      </motion.div>
    </div>
  );
}
