import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Multi-stage “AI attribute scan” overlay for private / no-image registration.
 * Stages: idle → parsing → scanning → matching → result
 */

const SCANNING_MESSAGES = [
  'Scanning records…',
  'Analyzing patterns…',
  'Cross-referencing sightings…',
];

/** Derive display chips from form-like object (non-empty values only). */
export function buildAttributeChips(form) {
  const entries = [
    ['Name', form.name],
    ['Age', form.age != null && form.age !== '' && `${form.age} yrs`],
    ['Gender', form.gender],
    ['Address', form.address],
    ['Height', form.height && Number(form.height) > 0 && `${form.height} cm`],
    ['Weight', form.weight && Number(form.weight) > 0 && `${form.weight} kg`],
    ['Build', form.built],
    ['District', form.district],
    ['State', form.state],
    ['Spectacles', form.spectacles],
    ['Hair type', form.hair_type],
    ['Hair length', form.hair_length],
    ['Blood group', form.blood_group],
    ['Birth marks', form.birthmarks],
    ['Tattoos', form.tattoos],
    ['Piercings', form.piercings],
    ['Dental', form.dental],
    ['Last seen', form.last_seen],
  ];

  return entries
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([label, value]) => ({
      id: `${label}-${value}`,
      label,
      value: String(value).trim(),
    }));
}

export default function AttributeScanAnimation({
  open,
  onClose,
  chips,
  speed = 'realistic', // 'fast' | 'realistic'
  /** Must resolve to { caseId, matched, matches } or throw */
  runPipeline,
  /** Fires when analysis finishes (success or error), before user clicks Continue */
  onAnalysisComplete,
}) {
  const mult = speed === 'fast' ? 0.35 : 1;
  const [stage, setStage] = useState('idle');
  const [scanMsgIndex, setScanMsgIndex] = useState(0);
  const [confidence, setConfidence] = useState(10);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const chipDelay = useMemo(() => 220 * mult, [mult]);
  const minScanMs = useMemo(() => 2600 * mult, [mult]);

  const reset = useCallback(() => {
    setStage('idle');
    setScanMsgIndex(0);
    setConfidence(10);
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    let cancelled = false;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      setError(null);
      setResult(null);
      setConfidence(10);
      setStage('parsing');

      const parseMs = Math.max(
        900 * mult,
        (Math.max(chips.length, 1) * chipDelay) + 450 * mult
      );
      await sleep(parseMs);
      if (cancelled) return;

      setStage('scanning');
      const pipelinePromise = runPipeline();

      await sleep(minScanMs);
      if (cancelled) return;

      setStage('matching');

      let apiOutcome;
      try {
        apiOutcome = await pipelinePromise;
      } catch (e) {
        const msg = e?.message || 'Registration failed';
        setError(msg);
        setStage('result');
        onAnalysisComplete?.({ success: false, error: msg });
        return;
      }
      if (cancelled) return;

      const matches = apiOutcome?.matches || [];
      const hasMatches = Boolean(apiOutcome?.matched && matches.length > 0);
      const targetConfidence = hasMatches
        ? Math.min(92, 58 + Math.min(matches.length * 8, 34))
        : Math.floor(28 + Math.random() * 12);

      const dur = 1400 * mult;
      const steps = 24;
      const stepMs = dur / steps;
      for (let i = 0; i <= steps; i++) {
        if (cancelled) return;
        const current = 10 + ((targetConfidence - 10) * i) / steps;
        setConfidence(Math.round(current));
        await sleep(stepMs);
      }

      const payload = {
        hasMatches,
        matchCount: matches.length,
        matches,
        caseId: apiOutcome?.caseId,
      };
      setResult(payload);
      setStage('result');
      onAnalysisComplete?.({
        success: true,
        caseId: apiOutcome?.caseId,
        matched: apiOutcome?.matched,
        matches,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [open, chips.length, chipDelay, minScanMs, mult, reset, runPipeline, speed]);

  useEffect(() => {
    if (stage !== 'scanning') return;
    const id = setInterval(() => {
      setScanMsgIndex((i) => (i + 1) % SCANNING_MESSAGES.length);
    }, 1800 * mult);
    return () => clearInterval(id);
  }, [stage, mult]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-900/95 shadow-[0_0_40px_-8px_rgba(34,211,238,0.35)]"
            initial={{ scale: 0.96, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_55%)]" />

            <div className="relative px-6 py-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
                    Attribute intelligence
                  </p>
                  <h3 className="text-lg font-semibold text-slate-50">
                    Private case analysis
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  {speed === 'fast' ? 'Fast mode' : 'Full scan'}
                </span>
              </div>

              {/* Stage: parsing */}
              {stage === 'parsing' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">Parsing registered attributes…</p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * (chipDelay / 1000), duration: 0.35 }}
                        className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 shadow-[0_0_12px_-4px_rgba(34,211,238,0.4)]"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="font-medium text-cyan-100/90">{c.label}</span>
                        <span className="text-slate-400">·</span>
                        <span className="max-w-[140px] truncate text-slate-300">{c.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage: scanning */}
              {(stage === 'scanning' || stage === 'matching') && (
                <div className="space-y-4">
                  <div className="relative h-36 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/80">
                    <motion.div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                      animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
                      transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                    />
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute top-4 left-4 h-16 w-12 rounded-md bg-slate-800/90 blur-[1px]"
                        style={{ left: `${20 + i * 28}%`, top: `${12 + (i % 2) * 8}px` }}
                        animate={{ opacity: [0.35, 0.7, 0.35], x: [0, 6, -4, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    ))}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                      animate={{ top: ['10%', '88%', '10%'] }}
                      transition={{ duration: 3.2 * mult, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="absolute bottom-3 left-3 right-3">
                      <TypingLine text={SCANNING_MESSAGES[scanMsgIndex]} />
                    </div>
                  </div>

                  {stage === 'matching' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Match confidence</span>
                        <span className="font-mono text-cyan-300 tabular-nums">{confidence}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                          initial={{ width: '10%' }}
                          animate={{ width: `${confidence}%` }}
                          transition={{ duration: 0.25 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stage: result */}
              {stage === 'result' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {error ? (
                    <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                      {error}
                    </div>
                  ) : result?.hasMatches ? (
                    <>
                      <p className="text-center text-base font-semibold text-emerald-300">
                        Match found –{' '}
                        <span className="tabular-nums">{result.matchCount}</span> probable
                        match{result.matchCount !== 1 ? 'es' : ''} identified
                      </p>
                      <p className="text-center text-xs text-slate-500">
                        Case ID: <span className="font-mono text-slate-400">{result.caseId}</span>
                      </p>
                      {Array.isArray(result.matches) && result.matches.length > 0 && (
                        <div className="max-h-40 space-y-2 overflow-y-auto">
                          {result.matches.slice(0, 4).map((m, idx) => (
                            <motion.div
                              key={m.public_id || idx}
                              initial={{ opacity: 0, scale: 0.97 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.08 }}
                              className="rounded-lg border border-emerald-500/35 bg-emerald-950/40 px-3 py-2 text-left text-xs text-slate-300 shadow-[0_0_20px_-6px_rgba(52,211,153,0.45)]"
                            >
                              <span className="font-mono text-emerald-200/90">
                                #{String(m.public_id || '').slice(0, 8)}…
                              </span>
                              {m.score != null && (
                                <span className="ml-2 text-emerald-400/90">
                                  score {m.score}
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-center text-base font-medium text-slate-200">
                        No strong matches yet. Continuing background scan…
                      </p>
                      <p className="text-center text-sm text-slate-400">
                        We’ll notify you when new sightings align with these attributes.
                      </p>
                      {result?.caseId && (
                        <p className="text-center text-xs text-slate-500">
                          Case ID:{' '}
                          <span className="font-mono text-slate-400">{result.caseId}</span>
                        </p>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypingLine({ text }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text]);

  return (
    <p className="font-mono text-xs text-cyan-200/95 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]">
      {display}
      <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-cyan-400 align-middle" />
    </p>
  );
}
