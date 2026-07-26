"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CONFIG } from "@/config";
import { generateQRDataURL } from "@/utils/generateQR";
import { ImageIcon, RefreshIcon } from "@/components/icons";
import { QRLoading } from "@/components/LoadingAnimations";

interface QRScreenProps {
  photoUrl: string;
  onNewPhoto: () => void;
}

export default function QRScreen({ photoUrl, onNewPhoto }: QRScreenProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generateQRDataURL(photoUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  // Auto-reset to idle after inactivity
  useEffect(() => {
    if (!qrDataUrl && !qrError) return; // Wait for QR to finish generating
    const timer = setTimeout(() => {
      onNewPhoto();
    }, CONFIG.autoResetSeconds * 1000);
    return () => clearTimeout(timer);
  }, [qrDataUrl, qrError, onNewPhoto]);

  // Countdown display for auto-reset
  const [resetCountdown, setResetCountdown] = useState<number>(CONFIG.autoResetSeconds);
  useEffect(() => {
    if (!qrDataUrl && !qrError) return;
    setResetCountdown(CONFIG.autoResetSeconds);
    const interval = setInterval(() => {
      setResetCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [qrDataUrl, qrError]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-full w-full p-6 lg:p-10 gap-8 lg:gap-14">
      {/* Photo preview */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-[280px] md:w-[320px] rounded-xl overflow-hidden card-strong p-2">
          {imgError ? (
            <div
              className="w-full h-[400px] flex items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.02)" }}
            >
              <div className="flex flex-col items-center gap-2" style={{ color: "#b0b0b0" }}>
                <ImageIcon className="w-7 h-7" />
                <p className="text-[10px]">Unavailable</p>
              </div>
            </div>
          ) : (
            <motion.img
              src={photoUrl}
              alt="Your photo"
              className={`w-full h-auto object-contain rounded-lg shadow-sm ${imgLoaded ? "" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: imgLoaded ? 1 : 0 }}
              transition={{ duration: 0.35 }}
            />
          )}
        </div>
        {!imgLoaded && !imgError && (
          <div className="w-[280px] md:w-[320px] h-[400px] rounded-xl card-strong p-2 absolute top-0 left-0">
            <div
              className="w-full h-full rounded-lg animate-pulse"
              style={{ background: "rgba(0,0,0,0.03)" }}
            />
          </div>
        )}
      </motion.div>

      {/* QR + actions */}
      <motion.div
        className="flex flex-col items-center gap-5"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{ background: "rgba(5, 150, 105, 0.1)", color: "#059669" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Paid
          </div>
          <h2
            className="text-3xl md:text-4xl font-black tracking-tighter"
            style={{ fontFamily: "var(--font-heading)", color: "#1a1a1a" }}
          >
            Thank You!
          </h2>
          <p className="mt-2 subtitle-premium text-sm">Scan here for your free digital copy</p>
        </div>

        {/* QR code */}
        <motion.div
          className="w-64 h-64 md:w-72 md:h-72 rounded-xl card p-4 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.15 }}
        >
          {qrError ? (
            <div className="flex flex-col items-center gap-2" style={{ color: "#b0b0b0" }}>
              <p className="text-xs">QR error</p>
            </div>
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-full h-full" />
          ) : (
            <QRLoading />
          )}
        </motion.div>

        {/* Souvenir prompt */}
        <div
          className="w-full max-w-xs rounded-xl p-3 text-center"
          style={{ background: "rgba(128, 0, 0, 0.06)", border: "1px solid rgba(128, 0, 0, 0.15)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg
              className="w-4 h-4 shrink-0"
              style={{ color: "#800000" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-xs font-bold" style={{ color: "#800000" }}>
              WANT A PRINTED SOUVENIR?
            </p>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "#666" }}>
            Just ask an officer in{" "}
            <span className="font-bold" style={{ color: "#800000" }}>
              maroon
            </span>{" "}
            for your printed copy!
          </p>
        </div>

        {/* URL */}
        <p className="text-xs text-center max-w-xs" style={{ color: "#9a9a9a", lineHeight: "1.5" }}>
          Show this to the attendant if you have any issues with the QR code.
        </p>

        {/* Auto-reset countdown + New Photo */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[288px]">
          <button
            onClick={onNewPhoto}
            className="btn-accent px-14 py-5 text-xl w-full gap-3 !min-h-fit font-bold tracking-wide rounded-2xl"
          >
            <RefreshIcon className="w-6 h-6" />
            New Photo
          </button>
          {resetCountdown > 0 && resetCountdown < CONFIG.autoResetSeconds && (
            <p className="text-[11px] font-medium tracking-wider" style={{ color: "#b0b0b0" }}>
              Auto-reset in {resetCountdown}s
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
