"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { CheckIcon, WarningIcon, RefreshIcon, ArrowLeftIcon } from "@/components/icons";
import { ProcessingLoading } from "@/components/LoadingAnimations";

type Status = "creating" | "uploading" | "success" | "error";

export default function ProcessingScreen({
  blob,
  consent,
  onSuccess,
  onError,
}: {
  blob: Blob | null;
  consent: boolean;
  onSuccess: (url: string) => void;
  onError: (error: string) => void;
}) {
  const [status, setStatus] = useState<Status>("creating");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const doUpload = useCallback(
    async (b: Blob) => {
      setStatus("uploading");
      try {
        const tags = consent ? ["consent_yes", "photobooth"] : ["consent_no", "photobooth"];
        const r = await uploadToCloudinary(b, tags);
        setStatus("success");
        onSuccess(r.secure_url);
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Upload failed. Please try again.";
        setStatus("error");
        setErrorMsg(msg);
      }
    },
    [onSuccess, consent],
  );

  useEffect(() => {
    if (status !== "creating" || !blob) return;
    const t = setTimeout(() => doUpload(blob), 80);
    return () => clearTimeout(t);
  }, [blob, doUpload, status]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <AnimatePresence mode="wait">
        {!blob && (
          <motion.div
            key="creating"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ProcessingLoading />
            <div className="text-center">
              <h3
                className="text-2xl font-black tracking-tight text-gradient"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Creating
              </h3>
              <p className="subtitle-premium text-xs mt-1">Rendering canvas...</p>
            </div>
          </motion.div>
        )}

        {status === "uploading" && (
          <motion.div
            key="uploading"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ProcessingLoading />
            <div className="text-center">
              <h3
                className="text-2xl font-black tracking-tight text-gradient"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Uploading
              </h3>
              <p className="subtitle-premium text-xs mt-1">Saving your photo...</p>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckIcon className="w-5 h-5" style={{ color: "#16a34a" }} />
            </motion.div>
            <div className="text-center">
              <h3
                className="text-2xl font-black tracking-tight text-gradient"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Complete
              </h3>
              <p className="subtitle-premium text-xs mt-1">Redirecting...</p>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            className="flex flex-col items-center gap-5 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <WarningIcon className="w-5 h-5" style={{ color: "#dc2626" }} />
            </div>
            <div className="max-w-xs">
              <h3
                className="text-2xl font-black tracking-tight mb-1"
                style={{ fontFamily: "var(--font-heading)", color: "#dc2626" }}
              >
                Upload Failed
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                {errorMsg || "Please try again."}
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => onError("cancelled")}
                className="btn-secondary px-5 py-2.5 text-xs !min-h-fit gap-1.5"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => {
                  setStatus("creating");
                  setErrorMsg(null);
                }}
                className="btn-accent px-5 py-2.5 text-xs !min-h-fit gap-1.5"
              >
                <RefreshIcon className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
