"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CONFIG } from "@/config";

interface Photo {
  id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  sizeKB: number;
  printUrl: string;
  thumbnailUrl: string;
  tags?: string[];
}

type ConsentFilter = "all" | "yes" | "no";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [consentFilter, setConsentFilter] = useState<ConsentFilter>("all");
  const [stats, setStats] = useState({ total: 0, totalSize: 0 });

  const fetchPhotos = useCallback(async (consent: ConsentFilter = "all") => {
    setLoading(true);
    setError(null);
    try {
      const params = consent === "all" ? "" : `?consent=${consent}`;
      const res = await fetch(`/api/photos${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to load photos");
      }
      const data = await res.json();
      setPhotos(data.photos || []);
      setStats({
        total: data.photos?.length || 0,
        totalSize: data.photos?.reduce((s: number, p: Photo) => s + p.sizeKB, 0) || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos(consentFilter);
  }, [fetchPhotos, consentFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === photos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(photos.map((p) => p.id)));
    }
  };

  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  const downloadPhoto = async (photo: Photo, printSize: boolean) => {
    const id = `${photo.id}-${printSize ? "print" : "orig"}`;
    if (downloading.has(id)) return;
    setDownloading((prev) => new Set(prev).add(id));

    const url = printSize ? photo.printUrl : photo.url;
    const filename = printSize
      ? `snapit-print-4x6-${photo.id.replace(/\//g, "-")}.jpg`
      : `snapit-${photo.id.replace(/\//g, "-")}.${photo.format}`;

    try {
      // Fetch as blob (Cloudinary supports CORS) so download attribute works
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke blob URL after a short delay to allow download to start
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const downloadSelected = (printSize: boolean) => {
    photos
      .filter((p) => selected.has(p.id))
      .forEach((p) => {
        // Small delay between each download to avoid browser blocking
        setTimeout(() => downloadPhoto(p, printSize), 200);
      });
  };

  const downloadAll = (printSize: boolean) => {
    photos.forEach((p, i) => {
      setTimeout(() => downloadPhoto(p, printSize), i * 200);
    });
  };

  const [printModal, setPrintModal] = useState<Photo[] | null>(null);

  const handlePrint = (photos: Photo[]) => {
    if (!photos.length) return;

    const win = window.open("", "_blank", "width=800,height=600,menubar=no,toolbar=no,location=no");
    if (!win) {
      alert("Please allow popups to print photos.");
      return;
    }

    // Render ALL photos on the print page, each on its own 4×6 page
    const items = photos
      .map(
        (p) => `
      <div class="page">
        <img src="${p.printUrl}" />
      </div>`,
      )
      .join("");

    win.document.write(`
      <html>
      <head>
        <title>Print ${photos.length} Photo${photos.length > 1 ? "s" : ""}</title>
        <style>
          @page { margin: 0; size: 6in 4in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: white; }
          .page {
            width: 6in;
            height: 4in;
            display: flex;
            justify-content: center;
            align-items: center;
            page-break-after: always;
          }
          .page:last-child { page-break-after: auto; }
          img {
            max-width: 6in;
            max-height: 4in;
            object-fit: contain;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${items}
        <script>
          // Auto-trigger print dialog once all images load
          let loaded = 0;
          const imgs = document.querySelectorAll('img');
          const total = imgs.length;
          imgs.forEach(img => {
            if (img.complete) { loaded++; }
            else {
              img.onload = () => { loaded++; if (loaded === total) setTimeout(() => window.print(), 500); };
              img.onerror = () => { loaded++; if (loaded === total) setTimeout(() => window.print(), 500); };
            }
          });
          if (loaded === total) setTimeout(() => window.print(), 500);
        <\/script>
      </body>
      </html>
    `);
    win.document.close();

    setPrintModal(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#faf9f6] overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between z-10">
        <div>
          <h1
            className="text-xl font-black tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {CONFIG.boothName} Gallery
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading
              ? "Loading..."
              : `${stats.total} photos · ${(stats.totalSize / 1024).toFixed(1)} MB total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Consent filter buttons */}
          <div className="flex items-center gap-1.5 mr-3">
            {(
              [
                ["all", "All"],
                ["yes", "Can Post"],
                ["no", "Cannot Post"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setConsentFilter(key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  consentFilter === key
                    ? key === "yes"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : key === "no"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {photos.length > 0 && (
            <>
              <button
                onClick={selectAll}
                className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                style={{ background: "rgba(0,0,0,0.04)", color: "#4a4a4a" }}
              >
                {selected.size === photos.length ? "Deselect All" : `Select All (${photos.length})`}
              </button>
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {selected.size} selected
                  </span>
                  <button
                    onClick={() => downloadSelected(false)}
                    className="btn-accent text-xs px-4 py-2 !min-h-fit rounded-lg"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setPrintModal(photos.filter((p) => selected.has(p.id)))}
                    className="btn-accent text-xs px-4 py-2 !min-h-fit rounded-lg"
                    style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                  >
                    Print 4×6
                  </button>
                </div>
              )}
            </>
          )}
          <button
            onClick={() => fetchPhotos(consentFilter)}
            disabled={loading}
            className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
            style={{ background: "rgba(0,0,0,0.04)", color: "#4a4a4a" }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="max-w-2xl mx-auto mt-12">
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <h2 className="text-xl font-bold text-red-700 mb-3">Configuration Required</h2>
              <p className="text-sm text-red-600 leading-relaxed whitespace-pre-line mb-6">
                {error}
              </p>
              <div className="text-left max-w-md mx-auto bg-white/50 rounded-lg p-4 text-xs font-mono text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800 mb-2">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Go to <span className="text-blue-600">cloudinary.com/console</span>
                  </li>
                  <li>
                    Copy your <strong>Cloud Name</strong> from the dashboard
                  </li>
                  <li>
                    Go to <strong>Settings → Access Keys</strong>
                  </li>
                  <li>
                    Generate or copy your <strong>API Key</strong> and <strong>API Secret</strong>
                  </li>
                  <li>
                    Create <code className="bg-slate-100 px-1 rounded">.env.local</code> in the
                    project root:
                  </li>
                </ol>
                <pre className="mt-3 p-3 bg-slate-800 text-green-300 rounded-lg text-[11px] leading-relaxed">
                  {`CLOUDINARY_CLOUD_NAME=zlxsnd69
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here`}
                </pre>
                <p className="mt-2 text-xs text-slate-500">Then restart the dev server.</p>
              </div>
            </div>
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="spinner spinner-lg" />
              <p className="text-sm text-slate-400">Loading photos from Cloudinary...</p>
            </div>
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-400">No photos yet</p>
              <p className="text-sm text-slate-300 mt-1">
                Photos will appear here once people start using the booth.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && photos.length > 0 && (
          <div className="max-w-7xl mx-auto">
            {/* Bulk actions bar */}
            <div className="flex items-center gap-3 mb-4 text-xs text-slate-400">
              <button
                onClick={() => downloadAll(false)}
                className="font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5 flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download All ({photos.length})
              </button>
              <button
                onClick={() => setPrintModal(photos)}
                className="font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5 flex items-center gap-1.5"
                style={{ color: "#059669" }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print All as 4×6
              </button>
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="group relative"
                >
                  {/* Thumbnail */}
                  <button
                    onClick={() => toggleSelect(photo.id)}
                    className={`w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      selected.has(photo.id)
                        ? "border-blue-500 ring-2 ring-blue-200 shadow-lg"
                        : "border-transparent hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {selected.has(photo.id) && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Info overlay on hover */}
                  <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 text-[10px] text-slate-500 shadow-md border border-white/50">
                      <div className="flex items-center justify-between">
                        <span>
                          {photo.width}×{photo.height}
                        </span>
                        <span>{photo.sizeKB}KB</span>
                      </div>
                      <div className="truncate">{formatDate(photo.createdAt)}</div>
                    </div>
                  </div>

                  {/* Quick action buttons (appear on hover) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(photo, false);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                      title="Download original"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrintModal([photo]);
                      }}
                      className="w-7 h-7 rounded-full bg-emerald-50/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-emerald-50 transition-colors"
                      title="Print 4×6"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print Modal */}
      {printModal && printModal.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-black tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Print 4×6 Photos
                </h2>
                <button
                  onClick={() => setPrintModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                {printModal.length > 1
                  ? `${printModal.length} photos ready. Print one at a time.`
                  : "Preview your 4×6 print below."}
              </p>

              {/* Print previews */}
              <div className="space-y-4 mb-6">
                {printModal.map((p) => (
                  <div key={p.id} className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                    <div
                      className="w-full max-w-md rounded-lg overflow-hidden shadow-lg border border-slate-200"
                      style={{ aspectRatio: "6/4" }}
                    >
                      <img
                        src={p.printUrl}
                        alt="Print preview"
                        className="w-full h-full object-contain bg-white"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {p.width}×{p.height} · 4×6 print
                    </p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPrintModal(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePrint(printModal)}
                  className="flex-[2] py-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    color: "white",
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Send to Printer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="shrink-0 px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
        <span>Snap IT PhotoBooth · Admin Gallery</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
            Downloads happen in your browser — Cloudinary transforms on-the-fly
          </span>
          <a href="/" className="text-blue-500 hover:text-blue-700 font-medium">
            ← Back to Booth
          </a>
        </div>
      </footer>
    </div>
  );
}
