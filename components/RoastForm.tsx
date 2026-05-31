"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";

type RoastResult = { username: string; roast: string };

const spring = { type: "spring", stiffness: 380, damping: 26 } as const;
const EASE = [0.23, 1, 0.32, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const LOADING_MSGS = [
  "Analyzing your questionable taste…",
  "Judging your director obsessions…",
  "Consulting the film critics…",
  "Reading between the reels…",
  "Calculating your pretentiousness score…",
];

const Icon = {
  Flame: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" {...props}>
      <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 .2 1.2 1 1.5 1.5 1.5 0-2 .5-4.5 1.5-6.5zM6 14a6 6 0 1 0 12 0c0-3-2-5-2-5s.5 2-1 3c0 0-1-2-3-3-1 4-4 3-6 5z" />
    </svg>
  ),
  Copy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  Redo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  ),
  More: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" {...props}>
      <circle cx={5} cy={12} r={1.7} />
      <circle cx={12} cy={12} r={1.7} />
      <circle cx={19} cy={12} r={1.7} />
    </svg>
  ),
  Spinner: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 animate-spin" {...props}>
      <circle cx={12} cy={12} r={9} stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  ),
};

function RoastText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i} className="italic text-softer">{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="sticky top-0 z-30 w-full backdrop-blur-sm border-b border-line/60"
      style={{ backgroundColor: "rgba(20, 24, 28, 0.88)" }}
    >
      <div
        className="flex items-center justify-between w-full mx-auto"
        style={{ padding: "0 16px", height: "52px", maxWidth: "1280px" }}
      >
        {/* Logo — always one line */}
        <motion.div
          className="flex items-center"
          style={{ gap: "8px", flexShrink: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={spring}
        >
          <span className="flex items-center" style={{ flexShrink: 0 }}>
            <span className="inline-block rounded-full bg-orange" style={{ width: "12px", height: "12px", outline: "2px solid #14181c" }} />
            <span className="inline-block rounded-full bg-green" style={{ width: "12px", height: "12px", outline: "2px solid #14181c", marginLeft: "-4px" }} />
            <span className="inline-block rounded-full bg-blue" style={{ width: "12px", height: "12px", outline: "2px solid #14181c", marginLeft: "-4px" }} />
          </span>
          <span className="text-white whitespace-nowrap" style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Letterboxd <span className="text-mute" style={{ fontWeight: 400 }}>roast</span>
          </span>
        </motion.div>

        {/* Right */}
        <div className="flex items-center" style={{ gap: "6px", flexShrink: 0 }}>
          <span
            className="inline-flex items-center text-green border border-green/30 rounded-full bg-green/10 whitespace-nowrap"
            style={{ gap: "4px", fontSize: "8px", fontWeight: 700, letterSpacing: "0.14em", padding: "4px 8px" }}
          >
            <span className="rounded-full bg-green animate-pulse" style={{ width: "4px", height: "4px", flexShrink: 0 }} />
            AI-POWERED
          </span>
          <motion.button
            type="button"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            transition={spring}
            className="text-mute hover:text-white rounded-full transition-colors hidden sm:inline-flex items-center justify-center"
            style={{ padding: "8px" }}
            aria-label="More"
          >
            <Icon.More />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full flex justify-center"
    >
      <div className="text-center w-full" style={{ maxWidth: "860px", padding: "0 24px" }}>
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center"
          style={{ gap: "10px", marginBottom: "18px" }}
        >
          <span className="inline-block h-px bg-green" style={{ width: "18px", opacity: 0.7 }} aria-hidden />
          <span className="text-green font-bold" style={{ fontSize: "9px", letterSpacing: "0.2em" }}>
            FOR CINEPHILES WHO CAN TAKE A HIT
          </span>
          <span className="inline-block h-px bg-green" style={{ width: "18px", opacity: 0.7 }} aria-hidden />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-serif text-white"
          style={{ fontSize: "clamp(38px, 10vw, 80px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}
        >
          Your movie taste deserves{" "}
          <span
            className="text-orange italic"
            style={{ textShadow: "0 0 60px rgba(255,128,0,0.35)", display: "inline-block" }}
          >
            consequences.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-mute text-center"
          style={{ fontSize: "clamp(13px, 3.5vw, 15px)", lineHeight: 1.6, maxWidth: "34rem", margin: "16px auto 0" }}
        >
          Enter your Letterboxd username and let AI judge your entire personality based on your watch history.
        </motion.p>
      </div>
    </motion.div>
  );
}

type InputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  loadingMsg: string;
};

function RoastInput({ value, onChange, onSubmit, loading, loadingMsg }: InputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const disabled = loading || !value.trim();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ delay: 0.48 }}
      className="w-full flex justify-center"
      style={{ marginTop: "24px" }}
    >
      <form
        className="w-full"
        style={{ maxWidth: "480px", padding: "0 24px" }}
        onSubmit={(e) => { e.preventDefault(); if (!disabled) onSubmit(); }}
      >
        <div className="flex items-stretch bg-card border border-line rounded-xl overflow-hidden transition-all duration-200">
          {/* Shortened prefix on mobile */}
          <span
            className="flex items-center text-mute border-r border-line whitespace-nowrap"
            style={{ padding: "0 10px", fontSize: "11px", backgroundColor: "#16191e" }}
          >
            letterboxd.com/
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
            placeholder="yourusername"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-white placeholder:text-mute/70"
            style={{ padding: "13px 12px", fontSize: "15px", minWidth: 0 }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={disabled}
          suppressHydrationWarning
          whileHover={!disabled ? { scale: 1.015, boxShadow: "0 0 28px rgba(0,224,84,0.28)" } : {}}
          whileTap={!disabled ? { scale: 0.975 } : {}}
          transition={spring}
          className={[
            "w-full rounded-xl font-bold inline-flex items-center justify-center gap-2 transition-colors",
            disabled
              ? "bg-green/30 text-ink/60 cursor-not-allowed"
              : "bg-green text-ink hover:bg-green-deep hover:text-white",
          ].join(" ")}
          style={{ marginTop: "10px", padding: "15px", fontSize: "15px" }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Icon.Spinner />
              <span key={loadingMsg} style={{ animation: "msg-in 300ms ease-out both" }}>
                {loadingMsg}
              </span>
            </span>
          ) : (
            <>
              <span>Roast Me</span>
              <Icon.Flame />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

type ResultProps = {
  username: string;
  roast: string;
  onAgain: () => void;
  onClear: () => void;
};

function ResultCard({ username, roast, onAgain, onClear }: ResultProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  function copy() {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(roast).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  function shareToX() {
    const preview = roast.slice(0, 150).trim();
    const text = `my letterboxd got roasted 💀\n\n"${preview}..."\n\nget roasted → https://letterboxd-roast.vercel.app/`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function downloadImage() {
    if (!cardRef.current) return;
    await document.fonts.ready;
    const dataUrl = await toPng(cardRef.current, {
      backgroundColor: "#1c2127",
      pixelRatio: 2,
    });
    const link = document.createElement("a");
    link.download = `roast-${username}.png`;
    link.href = dataUrl;
    link.click();
  }

  const paragraphs = roast.split(/\n\n+/).filter(Boolean);

  return (
    <div className="w-full flex justify-center" style={{ marginTop: "20px" }}>
      <section className="w-full" style={{ maxWidth: "680px", padding: "0 24px" }}>
        <div
          ref={cardRef}
          className="bg-card rounded-2xl relative overflow-hidden"
          style={{
            padding: "18px 20px",
            boxShadow:
              "0 0 0 1px rgba(255,128,0,0.14), 0 0 50px rgba(255,128,0,0.07), 0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,128,0,0.5) 40%, rgba(232,78,36,0.4) 60%, transparent 100%)",
            }}
          />

          <div className="flex items-center justify-between" style={{ marginBottom: "14px" }}>
            <span className="text-orange font-bold tracking-[0.16em]" style={{ fontSize: "10px" }}>
              AI ROAST — {username.toUpperCase()}
            </span>
            <motion.button
              type="button"
              onClick={onClear}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={spring}
              className="text-mute hover:text-white font-bold tracking-wide transition-colors"
              style={{ fontSize: "12px" }}
            >
              close
            </motion.button>
          </div>

          <div className="text-white" style={{ fontSize: "clamp(13.5px, 3.8vw, 15.5px)", lineHeight: 1.7 }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ marginBottom: i < paragraphs.length - 1 ? "14px" : 0 }}>
                <RoastText text={para} />
              </p>
            ))}
          </div>

          <div className="flex items-center" style={{ marginTop: "18px", gap: "8px" }}>
            {/* Copy — left */}
            <motion.button
              type="button"
              onClick={copy}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink/50 hover:bg-ink text-softer hover:text-white font-semibold transition-colors"
              style={{ padding: "7px 12px", fontSize: "13px" }}
            >
              {copied ? (
                <><span className="text-green"><Icon.Check /></span>copied</>
              ) : (
                <><Icon.Copy />copy</>
              )}
            </motion.button>

            {/* Right group */}
            <div className="ml-auto flex items-center" style={{ gap: "8px" }}>
              <motion.button
                type="button"
                onClick={downloadImage}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink/50 hover:bg-ink text-softer hover:text-white font-semibold transition-colors"
                style={{ padding: "7px 12px", fontSize: "13px" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Save
              </motion.button>

              <motion.button
                type="button"
                onClick={shareToX}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink/50 hover:bg-ink text-softer hover:text-white font-semibold transition-colors"
                style={{ padding: "7px 12px", fontSize: "13px" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share
              </motion.button>

              <motion.button
                type="button"
                onClick={onAgain}
                whileHover={{ scale: 1.04, boxShadow: "0 0 22px rgba(255,128,0,0.35)" }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                className="inline-flex items-center gap-2 rounded-lg bg-orange hover:bg-orange-hot text-ink font-bold transition-colors"
                style={{ padding: "7px 12px", fontSize: "13px" }}
              >
                <Icon.Redo />
                Roast me again
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Footer() {
  const stripes = [
    { color: "#ff8000", top: "8px", delay: 0 },
    { color: "#00e054", top: "30px", delay: 0.09 },
    { color: "#40bcf4", top: "52px", delay: 0.18 },
  ];

  return (
    <footer style={{ marginTop: "48px" }}>
      <div className="w-full flex justify-center" style={{ marginBottom: "28px" }}>
        <div className="text-center px-6" style={{ maxWidth: "480px" }}>
          <p className="text-softer" style={{ fontSize: "13px" }}>
            Enjoyed the roast?{" "}
            <a
              href="https://trakteer.id/brofilepicture"
              className="underline decoration-mute/60 underline-offset-4 hover:text-white hover:decoration-white"
            >
              Buy me a coffee
            </a>{" "}
            <span aria-hidden="true">☕</span>
          </p>
          <p className="text-mute" style={{ fontSize: "11px", marginTop: "6px" }}>
            Unofficial fan project. Not affiliated with Letterboxd.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden w-full" style={{ height: "72px" }} aria-hidden>
        {stripes.map(({ color, top, delay }) => (
          <motion.div
            key={color}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay, ease: EASE }}
            className="absolute"
            style={{
              inset: "0 -10% auto",
              height: "24px",
              top,
              backgroundColor: color,
              transformOrigin: "left",
            }}
          />
        ))}
      </div>
    </footer>
  );
}

export default function RoastForm() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!loading) { setMsgIdx(0); return; }
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MSGS.length), 2200);
    return () => clearInterval(id);
  }, [loading]);

  async function runRoast(againOfSame = false) {
    const u = againOfSame ? result?.username : username.trim();
    if (!u) return;

    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u }),
        signal: controller.signal,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Something went wrong. Try again.");
      }
      setResult({ username: u, roast: data.roast.trim() });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Letterboxd might be slow — try again.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-ink text-white font-sans relative"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,128,0,0.07), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(64,188,244,0.05), transparent 70%)",
      }}
    >
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />

      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full"
          style={{
            width: "min(640px, 90vw)", height: "min(640px, 90vw)",
            left: "-80px", top: "-140px",
            background: "radial-gradient(circle, rgba(255,128,0,0.065) 0%, transparent 70%)",
            animation: "float-a 28s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "min(520px, 80vw)", height: "min(520px, 80vw)",
            right: "-60px", bottom: "-100px",
            background: "radial-gradient(circle, rgba(64,188,244,0.055) 0%, transparent 70%)",
            animation: "float-b 34s ease-in-out infinite",
            willChange: "transform",
          }}
        />
      </div>

      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        <Navbar />

        <main
          className="flex-1 flex flex-col items-center justify-center w-full"
          style={{ paddingTop: "40px", paddingBottom: "40px" }}
        >
          <Hero />

          <RoastInput
            value={username}
            onChange={setUsername}
            onSubmit={() => runRoast(false)}
            loading={loading}
            loadingMsg={LOADING_MSGS[msgIdx]}
          />

          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full text-center"
                style={{ maxWidth: "480px", padding: "0 24px", marginTop: "10px", fontSize: "14px", color: "#e84e24" }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {result && !loading && (
              <motion.div
                key={result.username + result.roast.slice(0, 24)}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ duration: 0.42, ease: EASE }}
                className="w-full"
              >
                <ResultCard
                  username={result.username}
                  roast={result.roast}
                  onAgain={() => runRoast(true)}
                  onClear={() => setResult(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}