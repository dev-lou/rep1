"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONFIG } from "@/config";
import { ArrowRightIcon } from "@/components/icons";
import { playInteractionSound } from "@/utils/audio";

interface LayoutPickerProps {
  onSelect: (layoutId: string, shots: number) => void;
}

const PREVIEW_IMG = "url('/preview-layout.png')";

function LayoutPreview({
  layoutId,
  previewMode = false,
}: {
  layoutId: string;
  previewMode?: boolean;
}) {
  const c = "rounded-lg overflow-hidden bg-cover bg-center";
  const bgStyle = { backgroundImage: PREVIEW_IMG };

  switch (layoutId) {
    case "strip":
      return (
        <div
          className={`flex flex-col gap-3 mx-auto p-4 ${previewMode ? "h-[500px] w-[350px] bg-white shadow-2xl rounded-xl" : "h-64 w-48"}`}
        >
          <div className={`flex-1 ${c}`} style={bgStyle} />
          <div className={`flex-1 ${c}`} style={bgStyle} />
          <div className={`flex-1 ${c}`} style={bgStyle} />
        </div>
      );
    case "grid":
      return (
        <div
          className={`grid grid-cols-2 gap-3 mx-auto p-4 ${previewMode ? "h-[500px] w-[500px] bg-white shadow-2xl rounded-xl" : "h-64 w-64"}`}
        >
          <div className={c} style={bgStyle} />
          <div className={c} style={bgStyle} />
          <div className={c} style={bgStyle} />
          <div className={c} style={bgStyle} />
        </div>
      );
    case "single":
      return (
        <div
          className={`flex items-center justify-center mx-auto p-4 ${previewMode ? "h-[500px] w-[450px] bg-white shadow-2xl rounded-xl" : "h-64 w-56"}`}
        >
          <div className={`w-full h-full ${c}`} style={bgStyle} />
        </div>
      );
    case "polaroid":
      return (
        <div
          className={`flex flex-col items-center mx-auto p-4 ${previewMode ? "h-[500px] w-[450px] bg-white shadow-2xl rounded-xl" : "h-64 w-56"}`}
        >
          <div className={`flex-1 w-full ${c}`} style={bgStyle} />
          <div
            className={`${previewMode ? "h-16" : "h-10"} w-3/4 mt-4 rounded-md bg-black/[0.02]`}
          />
        </div>
      );
    default:
      return null;
  }
}

export default function LayoutPicker({ onSelect }: LayoutPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "preview">("grid");

  const handleSelectLayout = (layoutId: string) => {
    playInteractionSound("click");
    setSelected(layoutId);
    setView("preview");
  };

  const handleRechoose = () => {
    playInteractionSound("rechoose");
    setView("grid");
    setSelected(null);
  };

  const handleConfirm = () => {
    playInteractionSound("confirm");
    if (!selected) return;
    const layout = CONFIG.layouts.find((l) => l.id === selected);
    if (layout) onSelect(layout.id, layout.shots);
  };

  const selectedLayoutInfo = CONFIG.layouts.find((l) => l.id === selected);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-12 gap-8 overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "grid" && (
          <motion.div
            key="grid-view"
            className="flex flex-col items-center w-full h-full justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div className="text-center mb-12">
              <h2
                className="text-6xl md:text-8xl font-black tracking-tighter text-gradient text-glow"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Choose Your Layout
              </h2>
              <p className="mt-6 subtitle-premium text-lg md:text-xl">
                Pick how your photos are arranged
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-7xl"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {CONFIG.layouts.map((layout) => (
                <motion.button
                  key={layout.id}
                  onClick={() => handleSelectLayout(layout.id)}
                  className="layout-card flex flex-col items-center p-6 rounded-2xl border-4 border-transparent bg-white shadow-sm hover:shadow-xl"
                  variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    transition:
                      "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <LayoutPreview layoutId={layout.id} />
                  <div className="mt-6 text-center flex flex-col items-center">
                    <h3
                      className="font-bold text-2xl tracking-tight"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {layout.name}
                    </h3>
                    <p className="text-base mt-2 px-2" style={{ color: "#64748b" }}>
                      {layout.description}
                    </p>
                    <span className="inline-block mt-4 text-sm font-semibold px-4 py-1.5 rounded-full badge-glass">
                      {layout.shots} {layout.shots === 1 ? "shot" : "shots"}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {view === "preview" && selected && (
          <motion.div
            key="preview-view"
            className="flex flex-col items-center w-full h-full justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          >
            <motion.div className="text-center mb-10">
              <h2
                className="text-5xl md:text-6xl font-black tracking-tighter text-gradient text-glow"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {selectedLayoutInfo?.name}
              </h2>
              <p className="mt-3 subtitle-premium text-lg">Preview</p>
            </motion.div>

            <motion.div
              className="mb-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <LayoutPreview layoutId={selected} previewMode={true} />
            </motion.div>

            <motion.div
              className="flex gap-6 items-center justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={handleRechoose}
                className="text-xl font-bold px-10 py-5 rounded-full badge-glass text-slate-700 tracking-wide"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Go Back
              </motion.button>

              <motion.button
                onClick={handleConfirm}
                className="btn-accent text-2xl font-bold px-16 py-6 gap-4 rounded-full shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Continue</span>
                <ArrowRightIcon className="w-6 h-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
