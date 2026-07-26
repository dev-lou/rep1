"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import IdleScreen from "@/components/IdleScreen";
import LayoutPicker from "@/components/LayoutPicker";
import CameraScreen from "@/components/CameraScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import QRScreen from "@/components/QRScreen";
import FrameSelector from "@/components/FrameSelector";
import { stageToBlob } from "@/utils/composeCanvas";

// Lazy-load Konva+background — they're heavy and only needed on specific screens
const FramePicker = dynamic(() => import("@/components/FramePicker"), { ssr: false });
const HighTechBackground = dynamic(() => import("@/components/HighTechBackground"), { ssr: false });

type ScreenState = "idle" | "layout" | "camera" | "frameSelector" | "frame" | "processing" | "qr";

export default function PhotoBooth() {
  const [screen, setScreen] = useState<ScreenState>("idle");
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [totalShots, setTotalShots] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [canvasBlob, setCanvasBlob] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState("none");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);

  // Reset everything when returning to idle
  const resetToIdle = useCallback(() => {
    setScreen("idle");
    setSelectedLayout(null);
    setTotalShots(0);
    setCapturedPhotos([]);
    setCanvasBlob(null);
    setPhotoUrl(null);
    setPhotoConsent(false);
    setSelectedFrame("none");
    stageRef.current = null;
  }, []);

  // Global Escape×3 to reset to idle (booth operator shortcut)
  const escapeCountRef = useRef(0);
  const escapeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        escapeCountRef.current += 1;
        if (escapeTimerRef.current) clearTimeout(escapeTimerRef.current);
        escapeTimerRef.current = setTimeout(() => {
          escapeCountRef.current = 0;
        }, 1000);

        if (escapeCountRef.current >= 3) {
          escapeCountRef.current = 0;
          resetToIdle();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (escapeTimerRef.current) clearTimeout(escapeTimerRef.current);
    };
  }, [resetToIdle]);

  // Handle layout selection
  const handleLayoutSelect = useCallback((layoutId: string, shots: number) => {
    setSelectedLayout(layoutId);
    setTotalShots(shots);
    setCapturedPhotos([]);
    setTimeout(() => {
      setScreen("camera");
    }, 300);
  }, []);

  // Handle camera completion — go to frame selector
  const handleCameraComplete = useCallback((photos: string[]) => {
    setCapturedPhotos(photos);
    setTimeout(() => {
      setScreen("frameSelector");
    }, 400);
  }, []);

  // Handle frame done
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFrameDone = useCallback((ref: React.RefObject<any>, consent: boolean) => {
    stageRef.current = ref.current;
    setPhotoConsent(consent);
    setTimeout(() => {
      setScreen("processing");
    }, 300);

    // Start converting the canvas to blob in parallel
    stageToBlob({ current: stageRef.current }).then((blob) => {
      if (blob) {
        setCanvasBlob(blob);
      }
    });
  }, []);

  // Handle upload success
  const handleUploadSuccess = useCallback((url: string) => {
    setPhotoUrl(url);
    setTimeout(() => {
      setScreen("qr");
    }, 400);
  }, []);

  // Handle upload error — go back to frame picker so user can retry
  const handleUploadError = useCallback((_error: string) => {
    setTimeout(() => {
      setScreen("frame");
    }, 200);
  }, []);

  // Handle new photo (return to idle from QR)
  const handleNewPhoto = useCallback(() => {
    setTimeout(() => {
      resetToIdle();
    }, 200);
  }, [resetToIdle]);

  // Navigate back from camera
  const handleCameraBack = useCallback(() => {
    setTimeout(() => {
      setScreen("layout");
    }, 200);
  }, []);

  // Handle frame selection
  const handleFrameSelect = useCallback((frameId: string) => {
    setSelectedFrame(frameId);
    setTimeout(() => {
      setScreen("frame");
    }, 300);
  }, []);

  // Navigate back from frame selector
  const handleFrameSelectorBack = useCallback(() => {
    setTimeout(() => {
      setScreen("camera");
    }, 200);
  }, []);

  // Navigate back from frame picker
  const handleFrameBack = useCallback(() => {
    setTimeout(() => {
      setScreen("camera");
    }, 200);
  }, []);

  // Change frame from frame picker — go back to selector
  const handleChangeFrame = useCallback(() => {
    setTimeout(() => {
      setScreen("frameSelector");
    }, 200);
  }, []);

  // Screen transition variants
  const screenVariants = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.04 },
  };

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#faf9f6" }}>
      <AnimatePresence>
        {["idle", "layout"].includes(screen) && (
          <motion.div
            key="background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <HighTechBackground />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {screen === "idle" && (
          <motion.div
            key="idle"
            className="absolute inset-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <IdleScreen
              onStart={() => {
                setTimeout(() => {
                  setScreen("layout");
                }, 200);
              }}
            />
          </motion.div>
        )}

        {screen === "layout" && (
          <motion.div
            key="layout"
            className="absolute inset-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <LayoutPicker onSelect={handleLayoutSelect} />
          </motion.div>
        )}

        {screen === "camera" && selectedLayout && (
          <motion.div
            key="camera"
            className="absolute inset-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <CameraScreen
              totalShots={totalShots}
              layoutId={selectedLayout}
              onComplete={handleCameraComplete}
              onBack={handleCameraBack}
            />
          </motion.div>
        )}

        {screen === "frameSelector" && (
          <motion.div
            key="frameSelector"
            className="absolute inset-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <FrameSelector onSelect={handleFrameSelect} onBack={handleFrameSelectorBack} />
          </motion.div>
        )}

        {screen === "frame" && (
          <motion.div
            key="frame"
            className="absolute inset-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <FramePicker
              photos={capturedPhotos}
              layoutId={selectedLayout || "single"}
              frameStyle={selectedFrame}
              onDone={handleFrameDone}
              onBack={handleFrameBack}
              onChangeFrame={handleChangeFrame}
            />
          </motion.div>
        )}

        {screen === "processing" && (
          <motion.div
            key="processing"
            className="absolute inset-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProcessingScreen
              blob={canvasBlob}
              consent={photoConsent}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </motion.div>
        )}

        {screen === "qr" && photoUrl && (
          <motion.div
            key="qr"
            className="absolute inset-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <QRScreen photoUrl={photoUrl} onNewPhoto={handleNewPhoto} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
