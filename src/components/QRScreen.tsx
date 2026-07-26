"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CONFIG } from "@/config";
import { generateQRDataURL } from "@/utils/generateQR";
import { ImageIcon, CopyIcon, RefreshIcon } from "@/components/icons";
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generateQRDataURL(photoUrl, { width: 400, margin: 2, color: { dark: "#1a1a1a", light: "#ffffff" } })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrError(true); });
    return () => { cancelled = true; };
  }, [photoUrl]);

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(photoUrl); }
    catch {
      const input = document.createElement("input");
      input.value = photoUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [photoUrl]);

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
            <div className="w-full h-[400px] flex items-center justify-center rounded-lg" style={{ background: "rgba(0,0,0,0.02)" }}>
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
            <div className="w-full h-full rounded-lg animate-pulse" style={{ background: "rgba(0,0,0,0.03)" }} />
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
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gradient text-glow" style={{ fontFamily: "var(--font-heading)" }}>
            Photo Ready
          </h2>
          <p className="mt-2 subtitle-premium text-sm">Scan to download</p>
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

        {/* URL */}
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2.5" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <input type="text" value={photoUrl} readOnly
              className="flex-1 bg-transparent text-[10px] font-mono truncate outline-none"
              style={{ color: "#9a9a9a" }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button onClick={handleCopy}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all active:scale-95"
              style={{ background: "rgba(0,0,0,0.05)", color: "#6b6b6b" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* New Photo */}
        <button onClick={onNewPhoto} className="btn-accent px-14 py-5 text-xl w-full max-w-[288px] gap-3 !min-h-fit font-bold tracking-wide rounded-2xl mt-2">
          <RefreshIcon className="w-6 h-6" />
          New Photo
        </button>
      </motion.div>
    </div>
  );
}
