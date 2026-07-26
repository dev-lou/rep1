"use client";

import { motion } from "framer-motion";

/**
 * Premium Animated Background with VISIBLE movement
 * Uses Framer Motion (guaranteed to work) instead of CSS keyframes.
 * High contrast colors + low blur = you can clearly see the rotation.
 */
export default function HighTechBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white">
      {/* ── ROTATING GRADIENT — uses Framer Motion so it WILL animate ── */}
      <motion.div
        style={{
          position: "absolute",
          width: "140%",
          height: "140%",
          top: "-20%",
          left: "-20%",
          background: `
            conic-gradient(
              from 0deg at 50% 50%,
              #dbeafe 0deg,
              #38bdf8 70deg,
              #06b6d4 140deg,
              #a7f3d0 200deg,
              #dbeafe 260deg,
              #60a5fa 320deg,
              #dbeafe 360deg
            )
          `,
          filter: "blur(40px)",
          opacity: 0.28,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ── COUNTER-ROTATING layer for extra depth ── */}
      <motion.div
        style={{
          position: "absolute",
          width: "120%",
          height: "120%",
          top: "-10%",
          left: "-10%",
          background: `
            conic-gradient(
              from 180deg at 50% 50%,
              rgba(219,234,254,0.8) 0deg,
              rgba(34,211,238,0.5) 120deg,
              rgba(167,243,208,0.6) 240deg,
              rgba(219,234,254,0.8) 360deg
            )
          `,
          filter: "blur(60px)",
          opacity: 0.18,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ── Strong white wash — keeps center crisp, blue only bleeds from edges ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 65% at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
        }}
      />

      {/* ── Premium High-Tech Concentric Rings (Animated) ── */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <motion.div
          className="absolute rounded-full border border-blue-400"
          style={{ width: "30vw", height: "30vw" }}
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute rounded-full border border-cyan-300"
          style={{ width: "45vw", height: "45vw" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {/* Dashed ring effect */}
          <div className="w-full h-full rounded-full border border-dashed border-cyan-400/50" />
        </motion.div>
      </div>

      {/* ── Center rotating orb — visible animation around content (now above white wash) ── */}
      <motion.div
        style={{
          position: "absolute",
          width: "50vw",
          height: "50vw",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          background: `
            conic-gradient(
              from 0deg,
              rgba(56, 189, 248, 0.25),
              rgba(6, 182, 212, 0.15),
              rgba(167, 243, 208, 0.2),
              rgba(96, 165, 250, 0.25),
              rgba(56, 189, 248, 0.25)
            )
          `,
          filter: "blur(35px)",
          mixBlendMode: "multiply",
        }}
        animate={{
          rotate: -360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* ── Grid Overlay ── */}
      <div
        className="absolute inset-0 z-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
