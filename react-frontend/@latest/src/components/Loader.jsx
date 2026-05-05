import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserRound, ImageIcon } from "lucide-react";

const DEFAULT_MESSAGES = [
  "Fetching cases…",
  "Analyzing data…",
  "Matching attributes…",
  "Preparing results…",
];

/**
 * Technical loader / scanning UI — full-screen overlay or inline block.
 * Framer Motion + Tailwind. No artificial delays; parent controls `open` from API state.
 */
export default function Loader({
  open,
  /** 'overlay' | 'inline' */
  mode = "overlay",
  messages = DEFAULT_MESSAGES,
  /** Optional hint: 'registered' | 'private' — adjusts subline only */
  activeCaseType = null,
  className = "",
}) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setMsgIndex(0);
      return;
    }
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [open, messages.length]);

  const cards = useMemo(
    () =>
      [
        { x: "8%", y: "18%", hasImage: true, delay: 0 },
        { x: "78%", y: "22%", hasImage: false, delay: 0.3 },
        { x: "14%", y: "68%", hasImage: false, delay: 0.5 },
        { x: "82%", y: "62%", hasImage: true, delay: 0.2 },
        { x: "48%", y: "12%", hasImage: true, delay: 0.4 },
        { x: "52%", y: "78%", hasImage: false, delay: 0.15 },
        { x: "32%", y: "42%", hasImage: false, delay: 0.35 },
        { x: "65%", y: "38%", hasImage: true, delay: 0.25 },
      ].map((c, i) => ({ ...c, key: i })),
    []
  );

  const subline =
    activeCaseType === "private"
      ? "Attribute-based correlation (no reference photo)"
      : activeCaseType === "registered"
        ? "Facial mesh correlation with public sightings"
        : "Cross-referencing your case with the database";

  const inner = (
    <div
      className={`relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/90 px-8 py-10 shadow-[0_0_60px_-20px_rgba(34,211,238,0.35)] ${className}`}
    >
      {/* Ambient grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating case tiles — mix image-style vs silhouette */}
      {cards.map((c) => (
        <motion.div
          key={c.key}
          className="pointer-events-none absolute h-14 w-11 rounded-lg border border-white/10"
          style={{ left: c.x, top: c.y }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: [0.25, 0.55, 0.3],
            y: [0, -6, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 4 + c.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: c.delay,
          }}
        >
          {c.hasImage ? (
            <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-900/90 backdrop-blur-md">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-cyan-500/30 to-emerald-500/20 blur-[2px]" />
              <ImageIcon className="absolute bottom-1 right-1 h-3 w-3 text-cyan-400/50" />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-slate-800/70 backdrop-blur-sm">
              <UserRound className="h-7 w-7 text-slate-500/80" strokeWidth={1.25} />
            </div>
          )}
        </motion.div>
      ))}

      {/* Scan line */}
      <motion.div
        className="pointer-events-none absolute left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.5)]"
        animate={{ top: ["22%", "78%", "22%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Central rings */}
      <div className="relative z-10 flex h-36 w-36 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-500/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-emerald-500/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-5 rounded-full border border-cyan-400/15"
          style={{ borderStyle: "dashed" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Circular progress trace */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#loaderGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="120 200"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -320 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Messages */}
      <div className="relative z-10 mt-8 max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messages[msgIndex]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="font-mono text-sm tracking-wide text-cyan-100/95"
          >
            <TypingChunk text={messages[msgIndex]} />
          </motion.p>
        </AnimatePresence>
        <motion.p
          className="mt-3 text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.2 }}
        >
          {subline}
        </motion.p>
      </div>
    </div>
  );

  if (mode === "inline") {
    if (!open) return null;
    return inner;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {inner}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Short typing reveal per message swap */
function TypingChunk({ text }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [text]);

  return (
    <>
      {shown}
      <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-cyan-400 align-middle" />
    </>
  );
}
