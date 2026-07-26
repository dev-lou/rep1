"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { CONFIG } from "@/config";
import { ArrowLeftIcon, UndoIcon, CameraOffIcon } from "@/components/icons";
import { CameraLoading } from "@/components/LoadingAnimations";

interface CameraScreenProps {
  totalShots: number;
  layoutId: string;
  onComplete: (photos: string[]) => void;
  onBack: () => void;
}

const getLayoutAspectRatio = (layoutId: string) => {
  switch (layoutId) {
    case 'strip': return '3 / 2'; // Classic 35mm landscape rectangle (less cropping than 16:9)
    case 'grid': return '1 / 1'; // Square cell
    case 'single': return '3 / 4'; // Portrait 
    case 'polaroid': return '1 / 1'; // Square photo inside polaroid frame
    default: return '4 / 3';
  }
};

const LayoutPreview = ({ layoutId, totalShots, capturedPhotos, currentShot }: { layoutId: string, totalShots: number, capturedPhotos: string[], currentShot: number }) => {
  const getBoxStyle = (i: number) => ({
    borderColor: i < capturedPhotos.length ? "transparent" : i === capturedPhotos.length && currentShot < totalShots ? `var(--accent)` : "rgba(0,0,0,0.06)",
    boxShadow: i === capturedPhotos.length && currentShot < totalShots ? `0 0 20px color-mix(in srgb, var(--accent) 30%, transparent)` : "none",
    background: i < capturedPhotos.length ? 'transparent' : 'rgba(255,255,255,0.6)',
  });

  const renderSlot = (i: number) => (
    <div key={i} className="flex-1 w-full rounded-lg border-2 overflow-hidden transition-all duration-300 relative bg-black/5" style={getBoxStyle(i)}>
      {capturedPhotos[i] ? (
        <img src={capturedPhotos[i]} alt={`Shot ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-black/20 font-heading">
          {i + 1}
        </div>
      )}
    </div>
  );

  if (layoutId === 'strip') {
    return (
      <div className="w-full max-w-[280px] bg-white p-4 rounded-2xl shadow-xl flex flex-col gap-4 aspect-[1/1.92]">
        {Array.from({ length: 3 }).map((_, i) => renderSlot(i))}
      </div>
    );
  }

  if (layoutId === 'grid') {
    return (
      <div className="w-full max-w-[320px] bg-white p-4 rounded-2xl shadow-xl flex flex-col aspect-square">
        <div className="flex-1 w-full flex gap-4 mb-4">
          {renderSlot(0)}
          {renderSlot(1)}
        </div>
        <div className="flex-1 w-full flex gap-4">
          {renderSlot(2)}
          {renderSlot(3)}
        </div>
      </div>
    );
  }

  if (layoutId === 'polaroid') {
    return (
      <div className="w-full max-w-[320px] bg-white p-5 pb-24 rounded-2xl shadow-xl flex flex-col aspect-[4/5.2]">
        {renderSlot(0)}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[320px] bg-white p-5 rounded-2xl shadow-xl flex flex-col aspect-[3/4]">
      {renderSlot(0)}
    </div>
  );
};

export default function CameraScreen({ totalShots, layoutId, onComplete, onBack }: CameraScreenProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentShot, setCurrentShot] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    setCapturedPhotos([]); setCurrentShot(0); setCountdown(null); setCameraError(null);
  }, []);

  const handleUserMedia = useCallback(() => { setCameraReady(true); setCameraError(null); }, []);
  const handleUserMediaError = useCallback((err: string | DOMException) => {
    setCameraReady(false);
    if (!window.isSecureContext) {
      setCameraError("Camera requires a secure connection. Open http://localhost:3000 instead of the network IP.");
      return;
    }
    if (typeof err === "string" && err.includes("NotAllowedError")) {
      setCameraError("Camera access denied. Click the camera icon in the Chrome address bar, then tap 'Try Again'.");
    } else if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
      setCameraError("Camera access denied. Click the camera icon in the Chrome address bar, then tap 'Try Again'.");
    } else if (err instanceof DOMException && (err.name === "NotFoundError" || err.message.includes("no camera"))) {
      setCameraError("No camera detected. Connect a webcam and try again.");
    } else {
      setCameraError("Camera not available. Check your webcam connection.");
    }
  }, []);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      setFlash(true);
      setTimeout(() => setFlash(false), CONFIG.flashDurationMs);
      if (CONFIG.enableSoundEffects) {
        try {
          const AudioCtx = window.AudioContext;
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 800;
          osc.type = "sine";
          gain.gain.value = 0.3;
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
        } catch {}
      }
      setCapturedPhotos((prev) => [...prev, screenshot]);
      setCurrentShot((prev) => prev + 1);
      setCountdown(null);
    }
  }, [webcamRef]);

  useEffect(() => {
    if (capturedPhotos.length === 0) return;
    if (capturedPhotos.length < totalShots) {
      const timer = setTimeout(() => setCountdown(CONFIG.countdownSeconds), 600);
      return () => clearTimeout(timer);
    }
  }, [capturedPhotos, totalShots]);

  useEffect(() => {
    if (!isCapturing || countdown === null) return;
    if (countdown <= 0) { capture(); return; }
    const timer = setTimeout(() => setCountdown((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isCapturing, capture]);

  // Camera timeout — don't spin forever if no camera detected
  useEffect(() => {
    if (cameraReady || cameraError) return;
    const timer = setTimeout(() => {
      if (!cameraReady && !cameraError) {
        setCameraError("Camera not detected. Connect a webcam and try again.");
        setCameraReady(false);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [cameraReady, cameraError]);

  const startCapture = useCallback(() => {
    if (isCapturing || !cameraReady) return;
    setIsCapturing(true);
    setCountdown(CONFIG.countdownSeconds);
  }, [isCapturing, cameraReady]);

  const handleRetake = useCallback(() => {
    if (capturedPhotos.length === 0) return;
    setCapturedPhotos((prev) => prev.slice(0, -1));
    setCurrentShot((prev) => prev - 1);
    setCountdown(null);
    setIsCapturing(false);
  }, [capturedPhotos]);

  useEffect(() => {
    if (capturedPhotos.length >= totalShots && totalShots > 0) {
      const timer = setTimeout(() => onComplete(capturedPhotos), 600);
      return () => clearTimeout(timer);
    }
  }, [capturedPhotos, totalShots, onComplete]);

  const progress = totalShots > 0 ? (capturedPhotos.length / totalShots) * 100 : 0;

  return (
    <div className="relative flex flex-col h-full w-full">
      <AnimatePresence>
        {flash && (
          <motion.div
            className="flash-overlay"
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: CONFIG.flashDurationMs / 1000 }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-8 py-5 z-10 shrink-0">
        <button onClick={onBack} className="btn-secondary px-5 py-3 text-sm !min-h-fit gap-2 font-semibold" disabled={isCapturing}>
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1 max-w-md mx-auto">
          <div className="flex justify-between text-xs font-bold mb-2 px-1" style={{ color: "#8a8a8a" }}>
            <span>PHOTO {Math.min(capturedPhotos.length + 1, totalShots)} OF {totalShots}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar h-2 bg-black/5 rounded-full overflow-hidden">
            <div className="progress-bar-fill h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="w-[100px]" /> {/* Spacer for centering */}
      </div>

      {/* Main 3-Column Area */}
      <div className="flex-1 flex px-8 pb-8 relative min-h-0 gap-6">
        
        {/* LEFT: Layout Preview Panel */}
        <div className="w-[360px] shrink-0 h-full flex flex-col items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center w-full"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 font-heading">Live Preview</h3>
            <LayoutPreview layoutId={layoutId} totalShots={totalShots} capturedPhotos={capturedPhotos} currentShot={currentShot} />
            
            <AnimatePresence>
              {capturedPhotos.length > 0 && !isCapturing && (
                <motion.button
                  onClick={handleRetake}
                  className="mt-8 btn-secondary px-6 py-3 text-sm !min-h-fit gap-2 shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UndoIcon className="w-4 h-4" />
                  Retake Last Photo
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CENTER: Camera Feed */}
        <div className="flex-1 h-full flex items-center justify-center min-w-0 bg-black/5 rounded-3xl p-4 shadow-inner">
          {cameraError ? (
            <motion.div
              className="flex flex-col items-center gap-5 text-center card-strong p-10 max-w-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
                <CameraOffIcon className="w-6 h-6" style={{ color: "#6b6b6b" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "#1a1a1a" }}>Camera Unavailable</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8a8a8a" }}>{cameraError}</p>
              </div>
              <div className="flex gap-3 mt-1">
                <button onClick={onBack} className="btn-secondary px-5 py-2.5 text-xs !min-h-fit">Go Back</button>
                <button onClick={() => { setCameraError(null); setCameraReady(false); }} className="btn-accent px-5 py-2.5 text-xs !min-h-fit">Try Again</button>
              </div>
            </motion.div>
          ) : (
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
              style={{ 
                aspectRatio: getLayoutAspectRatio(layoutId),
                height: '70vh',
                backgroundColor: '#000'
              }}
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="absolute inset-0 w-full h-full object-cover"
                mirrored
              />

              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.85)" }}>
                  <div className="flex flex-col items-center gap-5">
                    <CameraLoading />
                    <p className="text-sm font-medium" style={{ color: "#8a8a8a" }}>Starting camera...</p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {isCapturing && countdown !== null && countdown > 0 && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.span
                      key={countdown}
                      className="text-9xl md:text-[200px] font-black text-white drop-shadow-2xl"
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {countdown}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* RIGHT: Capture Button Panel */}
        <div className="w-[200px] shrink-0 h-full flex flex-col items-center justify-center">
          {cameraReady && !isCapturing && currentShot < totalShots && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.button
                onClick={startCapture}
                className="w-32 h-32 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl relative group"
                style={{ border: "6px solid rgba(59, 130, 246, 0.3)", background: "rgba(255,255,255,0.7)" }}
                whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.8)" }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Continuous smooth expanding ring — CSS GPU-accelerated */}
                <div className="absolute inset-0 rounded-full border-4 border-blue-400 capture-ring" />
                
                {/* Inner button that breathes gently — CSS GPU-accelerated */}
                <div 
                  className="w-24 h-24 rounded-full transition-colors group-hover:bg-blue-500 flex items-center justify-center capture-pulse" 
                  style={{ background: "rgba(59, 130, 246, 0.9)" }}
                >
                   <div className="w-10 h-10 rounded-full border-4 border-white opacity-80" />
                </div>
              </motion.button>
              <div className="text-center">
                 <span className="subtitle-premium text-sm text-blue-600 font-bold block mb-1">Press to Shoot</span>
                 <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">{totalShots - currentShot} Left</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
