import { useEffect, useState } from "react";
import { useReveal, useScrollProgress } from "@/lib/stationsense/useReveal";
import {
  ClockIcon,
  CrowdDots,
  MovingTrain,
  StationDiagram,
  TrainSilhouette,
} from "@/lib/stationsense/illustrations";
import { SXLogo } from "@/components/SXLogo";

type TimelineEntry = {
  time: string;
  label: string;
  tone: "neutral" | "warn" | "danger" | "info";
  text: string;
  density: number; // crowd density 0..1 for that moment
};

const TIMELINE: TimelineEntry[] = [
  { time: "7:30 PM", label: "T-145 min", tone: "neutral", density: 0.18,
    text: "Maha Kumbh festival in full swing. Platforms 14 & 15 handle all Prayagraj-bound trains. Crowds building, but within capacity." },
  { time: "8:15 PM", label: "T-100 min", tone: "warn",    density: 0.42,
    text: "Prayagraj Express now +45 min late. Prayagraj Special +30 min. Passengers keep arriving. None of the trains have departed." },
  { time: "9:30 PM", label: "T-25 min",  tone: "danger",  density: 0.82,
    text: "Both trains still delayed. Platforms 14 & 15 packed far beyond capacity. No alert was sent. No crowd-control action taken." },
  { time: "9:55 PM", label: "Stampede",  tone: "danger",  density: 1.0,
    text: "Stampede on the footbridge between platforms 14 and 15. 18 dead. 15 injured. Youngest victim: 7 years old." },
];

const TONE_COLOR: Record<TimelineEntry["tone"], string> = {
  neutral: "#8e8e93",
  warn:    "#d97706",
  danger:  "#dc2626",
  info:    "#2563eb",
};

// Custom Link router component for Zenway
function Link({
  to,
  children,
  className,
  style,
  search,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  search?: Record<string, string>;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    let url = to;
    if (search) {
      const q = new URLSearchParams(search);
      url += `?${q.toString()}`;
    }
    window.history.pushState({}, '', url);
    const event = new Event('pushstate-changed');
    window.dispatchEvent(event);
  };
  return (
    <a href={to} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10, 10, 10, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid transparent",
        height: "64px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="mx-auto max-w-6xl w-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <SXLogo size={32} variant="dark" />
          <span style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}>
            Station<span style={{ color: "#3b82f6" }}>Sense</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: "rgba(255, 255, 255, 0.8)", textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <Link
            to="/ops-dashboard"
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              textDecoration: "none",
            }}
          >
            Ops Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = "StationSense — Predict crowd surges at Indian railway stations";
  }, []);

  return (
    <div style={{ background: "#f5f5f7", color: "#1a1a1a", fontFamily: "Inter, system-ui, sans-serif" }}>
      <ScrollProgressBar />
      <Header />
      <Hero />
      <ParallaxQuote />
      <TimelineStory />
      <CounterfactualSection />
      <ProductSection />
      <HowItWorksRail />
      <NumbersSection />
      <CTA />
      <footer className="mx-auto max-w-5xl px-6 py-10 text-xs" style={{ color: "#8e8e93" }}>
        StationSense — a proof of concept built from publicly available Indian Railways data.
      </footer>
    </div>
  );
}

function ScrollProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      setP(scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px]" style={{ background: "transparent" }}>
      <div className="h-full transition-[width] duration-150" style={{ width: `${p * 100}%`, background: "#dc2626" }} />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const ref = useScrollProgress<HTMLDivElement>();
  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ minHeight: "100svh", background: "#0a0a0a", color: "#fff" }}
    >
      {/* Background station grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 80%)",
          transform: "translateY(calc(var(--p, 0) * -40px))",
        }}
      />

      {/* Moving trains across the dark */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 right-0 ss-train-track" style={{ top: "22%" }}>
          <MovingTrain delay={0} color="#1f2937" />
        </div>
        <div className="absolute left-0 right-0 ss-train-track" style={{ top: "62%" }}>
          <MovingTrain delay={-5} color="#1f2937" />
        </div>
      </div>

      {/* Pulsing dot */}
      <div className="absolute right-6 top-6 md:right-10 md:top-10 flex items-center gap-2 text-xs tracking-widest">
        <span className="h-2 w-2 rounded-full ss-pulse" style={{ background: "#dc2626" }} />
        <span style={{ color: "#9ca3af" }}>LIVE FEED · IR PUBLIC API</span>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 md:pt-44 pb-24 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: "rgba(220,38,38,0.15)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.4)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#dc2626" }} />
          New Delhi Railway Station · 15 February 2025 · 21:55 IST
        </div>

        <h1
          className="mt-8 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]"
          style={{ animation: "ss-fade-up 1.1s cubic-bezier(.2,.7,.2,1) both" }}
        >
          18 people died<br />
          on platforms 14 and 15.
        </h1>
        <p
          className="mt-6 text-lg md:text-xl"
          style={{ color: "#9ca3af", animation: "ss-fade-up 1.4s cubic-bezier(.2,.7,.2,1) both" }}
        >
          The data to predict it existed 100 minutes earlier.<br />
          No system was watching.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center" style={{ animation: "ss-fade-up 1.6s cubic-bezier(.2,.7,.2,1) both" }}>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#2563eb" }}
          >
            Open dashboard
          </Link>
          <Link
            to="/dashboard"
            search={{ demo: "true", scenario: "critical" }}
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors"
            style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            Run Feb 15 replay →
          </Link>
          <Link
            to="/ops-dashboard"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            Ops Dashboard (Feature 2)
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-xs tracking-widest" style={{ color: "#6b7280" }}>
          <span>SCROLL</span>
          <span className="inline-block animate-bounce">↓</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pull quote ---------- */
function ParallaxQuote() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="px-6 py-32 md:py-48" style={{ background: "#0a0a0a", color: "#fff" }}>
      <div ref={ref} className="ss-reveal mx-auto max-w-3xl">
        <div className="text-xs tracking-widest" style={{ color: "#6b7280" }}>FROM THE OFFICIAL RAILWAY BOARD ENQUIRY</div>
        <blockquote className="mt-6 text-3xl md:text-5xl font-medium leading-tight tracking-tight">
          “There was no early-warning mechanism.<br />
          <span style={{ color: "#dc2626" }}>The crowd built up unnoticed.</span>”
        </blockquote>
      </div>
    </section>
  );
}

/* ---------- Scroll timeline with synchronized illustration ---------- */
function TimelineStory() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative" style={{ background: "#f5f5f7" }}>
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-12">
        <div className="text-xs font-semibold tracking-widest" style={{ color: "#dc2626" }}>
          THE 145 MINUTES BEFORE
        </div>
        <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Watch the data that nobody was looking at.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: "#8e8e93" }}>
          Scroll the timeline. The platform diagram on the right updates in real time —
          the exact same data StationSense polls from the public railway API every minute.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-32 grid gap-10 md:grid-cols-[1fr_minmax(0,1.1fr)]">
        {/* Left column — sticky scroll items */}
        <ol className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "#e8e8ec" }} />
          {TIMELINE.map((e, i) => (
            <TimelineItem key={i} entry={e} index={i} onEnter={() => setActive(i)} />
          ))}
        </ol>

        {/* Right column — sticky synchronized illustration */}
        <div className="md:sticky md:top-24 self-start">
          <SyncedScene entry={TIMELINE[active]} />
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  entry,
  index,
  onEnter,
}: {
  entry: TimelineEntry;
  index: number;
  onEnter: () => void;
}) {
  const ref = useReveal<HTMLLIElement>();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) onEnter();
        });
      },
      { threshold: 0.5, rootMargin: "-30% 0px -30% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = TONE_COLOR[entry.tone];
  return (
    <li ref={ref} className="ss-reveal relative flex gap-5 pb-16 last:pb-0" style={{ transitionDelay: `${index * 60}ms` }}>
      <div className="pt-1.5 relative z-10">
        <div
          className="h-4 w-4 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 0 4px ${color}22`,
            animation: entry.tone === "danger" ? "ss-pulse-ring 2s ease-out infinite" : undefined,
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <div className="text-sm font-semibold" style={{ color }}>{entry.time}</div>
          <div className="text-[10px] tracking-widest font-medium" style={{ color: "#8e8e93" }}>
            {entry.label}
          </div>
        </div>
        <p className="mt-2 text-base leading-relaxed">{entry.text}</p>
      </div>
    </li>
  );
}

function SyncedScene({ entry }: { entry: TimelineEntry }) {
  const isCritical = entry.tone === "danger";
  return (
    <div
      className="rounded-2xl p-5 md:p-6 transition-colors"
      style={{
        background: "#fff",
        border: "1px solid #e8e8ec",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] tracking-widest font-semibold" style={{ color: "#8e8e93" }}>
          NDLS · PLATFORMS 9–16
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: TONE_COLOR[entry.tone] }}>
          <span className="h-2 w-2 rounded-full ss-blink" style={{ background: TONE_COLOR[entry.tone] }} />
          {entry.time}
        </div>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden" style={{ background: isCritical ? "#fff5f5" : "#f5f5f7" }}>
        <StationDiagram critical={isCritical} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Crowd" value={`${Math.round(entry.density * 100)}%`} accent={TONE_COLOR[entry.tone]} />
        <Stat label="Delayed" value={entry.tone === "neutral" ? "1" : entry.tone === "warn" ? "3" : "6"} />
        <Stat label="Alert" value={isCritical ? "NONE" : entry.tone === "warn" ? "NONE" : "OK"} accent={isCritical ? "#dc2626" : undefined} />
      </div>

      <div className="mt-5">
        <div className="text-[10px] tracking-widest font-semibold mb-2" style={{ color: "#8e8e93" }}>
          PASSENGER DENSITY · FOOTBRIDGE
        </div>
        <CrowdDots density={entry.density} color={TONE_COLOR[entry.tone]} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "#f5f5f7" }}>
      <div className="text-[9px] tracking-widest font-semibold" style={{ color: "#8e8e93" }}>{label.toUpperCase()}</div>
      <div className="mt-1 text-lg font-semibold" style={{ color: accent ?? "#1a1a1a" }}>{value}</div>
    </div>
  );
}

/* ---------- Counterfactual: what StationSense would have shown ---------- */
function CounterfactualSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section style={{ background: "#0a0a0a", color: "#fff" }} className="px-6 py-28 md:py-40">
      <div ref={ref} className="ss-reveal mx-auto max-w-5xl">
        <div className="text-xs font-semibold tracking-widest" style={{ color: "#60a5fa" }}>
          THE SAME DATA · WITH STATIONSENSE
        </div>
        <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          At 8:15 PM, this alert would have hit the station manager's phone.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-[auto_1fr] items-center">
          <div className="flex items-center gap-4">
            <div style={{ animation: "ss-clock-tick 2.5s ease-in-out infinite", display: "inline-block" }}>
              <ClockIcon minutes={15} />
            </div>
            <div>
              <div className="text-3xl font-semibold">100 min</div>
              <div className="text-xs tracking-widest" style={{ color: "#9ca3af" }}>LEAD TIME TO ACT</div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 md:p-7 relative overflow-hidden"
            style={{ background: "#111827", border: "1px solid #1f2937" }}
          >
            <div className="absolute inset-x-0 top-0 h-12 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(96,165,250,0.18), transparent)", animation: "ss-scan 3s linear infinite" }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#60a5fa" }}>
                <span>⚠</span> AI OPS ALERT
              </div>
              <div className="text-xs" style={{ color: "#9ca3af" }}>20:15 · NDLS</div>
            </div>
            <p className="mt-3 text-lg leading-relaxed">
              Platforms <span style={{ color: "#fca5a5" }}>14 & 15</span> will exceed safe load in ~100 min.
              Two Prayagraj-bound trains delayed 45 and 30 min, both inbound to the same platforms.
              <br />
              <span style={{ color: "#86efac" }}>→ Redirect Prayagraj Express to platform 16.</span>
              <br />
              <span style={{ color: "#86efac" }}>→ Deploy RPF to the 14/15 footbridge.</span>
              <br />
              <span style={{ color: "#86efac" }}>→ Open additional exit gates on the east concourse.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Product section ---------- */
function ProductSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="ss-reveal mx-auto max-w-5xl px-6 py-24">
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{ background: "#dcfce7", color: "#16a34a" }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#16a34a" }} />
        No cameras. No hardware. No installation.
      </span>
      <h2 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight leading-tight max-w-3xl">
        Predict dangerous crowd surges before they form — using only public train delay data.
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "#8e8e93" }}>
        Every existing solution reacts after a crowd forms. StationSense pulls live delay data,
        calculates which platforms will be dangerously overcrowded as delayed trains converge,
        and gives station managers up to 2 hours of lead time.
      </p>
    </section>
  );
}

/* ---------- How it works — 3 illustrated rails ---------- */
function HowItWorksRail() {
  const items = [
    {
      n: "01",
      t: "Pull live train data",
      d: "Polls the Indian Railways public API for delays, ETAs, and platform assignments every minute.",
      illustration: <RailIllustration />,
    },
    {
      n: "02",
      t: "Score every platform",
      d: "Forecasts converging passenger load and headroom — flags critical platforms up to 2 hours out.",
      illustration: <ScoreIllustration />,
    },
    {
      n: "03",
      t: "Generate an alert",
      d: "Plain-language brief for the station manager: which platforms, what action, how much time.",
      illustration: <AlertIllustration />,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">
        How it works.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <RailCard key={it.n} {...it} delay={i * 90} />
        ))}
      </div>
    </section>
  );
}

function RailCard({
  n, t, d, illustration, delay,
}: { n: string; t: string; d: string; illustration: React.ReactNode; delay: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="ss-reveal rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "#fff", border: "1px solid #e8e8ec", transitionDelay: `${delay}ms` }}
    >
      <div className="h-40 relative overflow-hidden" style={{ background: "#f5f5f7" }}>
        {illustration}
      </div>
      <div className="p-6">
        <div className="text-xs font-semibold tracking-wider" style={{ color: "#2563eb" }}>{n}</div>
        <div className="mt-2 text-lg font-semibold">{t}</div>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#8e8e93" }}>{d}</p>
      </div>
    </div>
  );
}

function RailIllustration() {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-0 right-0 ss-train-track" style={{ top: "38%" }}>
        <MovingTrain delay={0} color="#1a1a1a" />
      </div>
      <div className="absolute left-0 right-0 ss-train-track" style={{ top: "72%" }}>
        <MovingTrain delay={-6} color="#2563eb" />
      </div>
    </div>
  );
}

function ScoreIllustration() {
  const bars = [22, 38, 30, 55, 90, 88, 60, 28];
  return (
    <div className="absolute inset-0 flex items-end gap-1.5 p-5">
      {bars.map((b, i) => {
        const color = b > 75 ? "#dc2626" : b > 50 ? "#d97706" : "#cbd5e1";
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm" style={{ height: `${b}%`, background: color, transition: "height 0.6s" }} />
            <div className="text-[9px]" style={{ color: "#8e8e93" }}>{9 + i}</div>
          </div>
        );
      })}
    </div>
  );
}

function AlertIllustration() {
  return (
    <div className="absolute inset-0 p-5 flex items-center justify-center">
      <div className="w-full rounded-lg p-3 text-xs" style={{ background: "#fff", border: "1px solid #e8e8ec" }}>
        <div className="flex items-center gap-2 font-semibold" style={{ color: "#2563eb" }}>
          <span className="h-1.5 w-1.5 rounded-full ss-blink" style={{ background: "#2563eb" }} />
          AI OPS ALERT · 20:15
        </div>
        <div className="mt-1.5 leading-snug" style={{ color: "#1a1a1a" }}>
          Platforms 14/15 critical in ~100 min. Redirect Prayagraj Express → 16.
        </div>
      </div>
    </div>
  );
}

/* ---------- Numbers ---------- */
function NumbersSection() {
  const stats = [
    { v: "100 min", l: "of lead time" },
    { v: "0", l: "cameras required" },
    { v: "7,330+", l: "stations covered by public API" },
    { v: "<1s", l: "to generate an alert" },
  ];
  return (
    <section className="border-y" style={{ background: "#fff", borderColor: "#e8e8ec" }}>
      <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="text-3xl md:text-4xl font-semibold tracking-tight">{s.v}</div>
            <div className="mt-1 text-xs tracking-widest" style={{ color: "#8e8e93" }}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTA() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative overflow-hidden" style={{ background: "#0a0a0a", color: "#fff" }}>
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute left-0 right-0 ss-train-track" style={{ top: "40%" }}>
          <MovingTrain delay={0} color="#1f2937" />
        </div>
        <div className="absolute left-0 right-0 ss-train-track" style={{ top: "70%" }}>
          <MovingTrain delay={-7} color="#1f2937" />
        </div>
      </div>
      <div ref={ref} className="ss-reveal relative mx-auto max-w-3xl px-6 py-32 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
          See the dashboard a station manager<br /> would have used that night.
        </h2>
        <p className="mt-5 text-base" style={{ color: "#9ca3af" }}>
          Watch the system go from quiet → elevated → critical → intervention in 24 seconds.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#2563eb" }}
          >
            Open dashboard
          </Link>
          <Link
            to="/dashboard"
            search={{ demo: "true", scenario: "critical" }}
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors"
            style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            Run Feb 15 replay →
          </Link>
          <Link
            to="/ops-dashboard"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            Ops Dashboard (Feature 2)
          </Link>
        </div>
        <div className="mt-12 flex items-center justify-center gap-6 opacity-50">
          <TrainSilhouette color="#fff" width={160} />
          <TrainSilhouette color="#fff" width={160} delayed />
          <TrainSilhouette color="#fff" width={160} />
        </div>
      </div>
    </section>
  );
}
