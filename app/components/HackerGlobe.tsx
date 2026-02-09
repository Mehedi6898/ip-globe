"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false }) as any;

type IpInfo = {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  org?: string;
  timezone?: string;
  country_code?: string;
};

type AuthResponse = {
  ok?: boolean;
  type?: string;
  message?: string;
};

type LogEntry = {
  id: number;
  ip: string;
  loc: string;
  status: "safe" | "warn" | "threat";
};

// Fake traffic data
const FAKE_TRAFFIC: Omit<LogEntry, "id">[] = [
  { ip: "185.220.101.XX", loc: "Berlin, DE", status: "warn" },
  { ip: "104.16.XX.XX", loc: "San Jose, US", status: "safe" },
  { ip: "5.188.62.XX", loc: "Moscow, RU", status: "threat" },
  { ip: "103.21.XX.XX", loc: "Mumbai, IN", status: "safe" },
  { ip: "91.108.XX.XX", loc: "London, UK", status: "safe" },
  { ip: "45.33.XX.XX", loc: "Tokyo, JP", status: "safe" },
  { ip: "195.154.XX.XX", loc: "Paris, FR", status: "warn" },
  { ip: "159.89.XX.XX", loc: "Singapore", status: "safe" },
  { ip: "203.0.113.XX", loc: "Sydney, AU", status: "safe" },
  { ip: "77.88.XX.XX", loc: "Amsterdam, NL", status: "warn" },
  { ip: "176.32.XX.XX", loc: "São Paulo, BR", status: "safe" },
  { ip: "41.72.XX.XX", loc: "Lagos, NG", status: "warn" },
  { ip: "223.5.XX.XX", loc: "Beijing, CN", status: "threat" },
];

const TOP_ORIGINS = [
  { country: "United States", pct: 28, flag: "🇺🇸" },
  { country: "Germany", pct: 15, flag: "🇩🇪" },
  { country: "India", pct: 12, flag: "🇮🇳" },
  { country: "Japan", pct: 9, flag: "🇯🇵" },
  { country: "Brazil", pct: 7, flag: "🇧🇷" },
];

export default function HackerGlobe({
  authResponse,
}: {
  authResponse?: AuthResponse;
}) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [arcsData, setArcsData] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [clock, setClock] = useState("00:00:00");
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [feedCount, setFeedCount] = useState(0);
  const [packets, setPackets] = useState(0);
  const [uptime, setUptime] = useState("00:00:00");
  const [chartBars, setChartBars] = useState<number[]>(
    Array.from({ length: 24 }, () => 10 + Math.random() * 90)
  );
  const startTimeRef = useRef(Date.now());
  const logIdRef = useRef(0);

  const EARTH_IMG =
    "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg";

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toTimeString().split(" ")[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Uptime + packets counter
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const s = String(elapsed % 60).padStart(2, "0");
      setUptime(`${h}:${m}:${s}`);
      setPackets((p) => p + Math.floor(Math.random() * 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live feed
  useEffect(() => {
    const addEntry = () => {
      const data = FAKE_TRAFFIC[Math.floor(Math.random() * FAKE_TRAFFIC.length)];
      const entry: LogEntry = { ...data, id: logIdRef.current++ };
      setLogEntries((prev) => [entry, ...prev].slice(0, 15));
      setFeedCount((c) => c + 1);
    };
    addEntry();
    const interval = setInterval(addEntry, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  // Chart bars update
  useEffect(() => {
    const interval = setInterval(() => {
      setChartBars(Array.from({ length: 24 }, () => 10 + Math.random() * 90));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate random arcs
  const generateArcs = useCallback(() => {
    const newArcs = [];
    for (let i = 0; i < 12; i++) {
      newArcs.push({
        startLat: (Math.random() - 0.5) * 140,
        startLng: (Math.random() - 0.5) * 360,
        endLat: (Math.random() - 0.5) * 140,
        endLng: (Math.random() - 0.5) * 360,
        color: Math.random() > 0.7 ? ["#ff3366", "#ff336680"] : ["#00ff88", "#00ff8880"],
      });
    }
    setArcsData(newArcs);
  }, []);

  useEffect(() => {
    generateArcs();
    const interval = setInterval(generateArcs, 6000);
    return () => clearInterval(interval);
  }, [generateArcs]);

  // Globe initial setup
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const c = g.controls();
    if (c) {
      c.autoRotate = true;
      c.autoRotateSpeed = 0.15;
      c.enableZoom = false;
      c.enablePan = false;
    }
    g.pointOfView({ lat: 20, lng: 100, altitude: 2 }, 0);
  }, []);

  async function fetchIP() {
    try {
      setBusy(true);
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("ipapi failed");
      const json = await res.json();
      return {
        ip: json.ip,
        city: json.city,
        region: json.region,
        country_name: json.country_name,
        latitude: Number(json.latitude),
        longitude: Number(json.longitude),
        org: json.org,
        timezone: json.timezone,
        country_code: json.country_code,
      } as IpInfo;
    } catch {
      try {
        const res2 = await fetch("https://ipwhois.app/json/");
        const json2 = await res2.json();
        return {
          ip: json2.ip,
          city: json2.city,
          region: json2.region,
          country_name: json2.country,
          latitude: Number(json2.latitude),
          longitude: Number(json2.longitude),
          org: json2.org,
          timezone: json2.timezone,
        } as IpInfo;
      } catch (err) {
        console.error(err);
        setBusy(false);
        return null;
      }
    }
  }

  function getLocalTime(tz?: string) {
    if (!tz) return "—";
    try {
      return new Date().toLocaleString("en-GB", {
        hour12: false,
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  }

  async function handleGetIp() {
    if (busy) return;
    setShowAuthMessage(false);
    const info = await fetchIP();
    if (!info) return;
    setIpInfo(info);
    setActive(true);

    const lat = Number(info.latitude ?? 0);
    const lng = Number(info.longitude ?? 0);

    setPoints([
      {
        lat,
        lng,
        size: 0.03,
        color: "rgba(0,255,136,0.95)",
        label: `${info.city ?? ""}, ${info.country_name ?? ""}`,
      },
    ]);

    setTimeout(() => {
      const g = globeRef.current;
      if (!g) {
        setBusy(false);
        setShowAuthMessage(true);
        return;
      }

      const controls = g.controls();
      if (controls) {
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.9;
      }

      g.pointOfView({ lat, lng, altitude: 0.45 }, 1600);

      setTimeout(() => {
        if (g.controls()) g.controls().autoRotate = false;
        setBusy(false);
        setShowAuthMessage(true);
      }, 2000);
    }, 300);
  }

  function handleContainerClick() {
    if (!active) setActive(true);
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    if (controls) {
      controls.enableZoom = true;
      controls.enablePan = true;
    }
  }

  const messageLines = (authResponse?.message || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  const latency = 12 + Math.floor(Math.random() * 25);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#040810]">
      {/* Noise overlay */}
      <div className="byt-noise" />

      {/* ═══════════ TOP BAR ═══════════ */}
      <div className="byt-topbar">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 60 60"
              fill="none"
              className="w-6 h-6"
              style={{ filter: "drop-shadow(0 0 6px rgba(0,255,136,0.5))" }}
            >
              <path
                d="M30 3L55 17V43L30 57L5 43V17L30 3Z"
                stroke="#00ff88"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="30" cy="30" r="5" fill="#00ff88" />
              <circle cx="30" cy="30" r="2" fill="#040810" />
            </svg>
            <span
              className="text-[14px] font-black tracking-[5px] text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              BYTRON
            </span>
          </div>

          <div className="w-px h-5 bg-[rgba(0,255,136,0.12)]" />

          <span
            className="text-[10px] tracking-[2px] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--byt-dim)",
            }}
          >
            Globe Intelligence
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Get IP Button */}
          <button
            onClick={handleGetIp}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-1.5 border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-[#040810] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            {busy ? "SCANNING..." : "GET IP & REVEAL"}
          </button>

          {/* Live status */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 border border-[rgba(0,255,136,0.2)]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "1px",
              color: "#00ff88",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] anim-pulse-dot" />
            LIVE
          </div>

          {/* Clock */}
          <span
            className="text-[11px]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--byt-dim)",
              letterSpacing: "1px",
            }}
          >
            {clock}
          </span>
        </div>
      </div>

      {/* ═══════════ LEFT SIDEBAR ═══════════ */}
      <div className="byt-sidebar byt-sidebar-left">
        {/* Your IP Card */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Your IP</span>
            <span className="byt-badge">
              {ipInfo ? "DETECTED" : "PENDING"}
            </span>
          </div>
          <div className="byt-ip mb-2">
            {ipInfo?.ip ?? "Awaiting..."}
          </div>
          <div className="byt-row">
            <span className="byt-label">ISP</span>
            <span className="byt-value">{ipInfo?.org ?? "—"}</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Timezone</span>
            <span className="byt-value">{ipInfo?.timezone ?? "—"}</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Local Time</span>
            <span className="byt-value byt-value-highlight">
              {getLocalTime(ipInfo?.timezone)}
            </span>
          </div>
        </div>

        {/* Location Card */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Location</span>
            <span className="byt-badge">GEO</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">City</span>
            <span className="byt-value">{ipInfo?.city ?? "—"}</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Region</span>
            <span className="byt-value">{ipInfo?.region ?? "—"}</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Country</span>
            <span className="byt-value">{ipInfo?.country_name ?? "—"}</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Lat / Lng</span>
            <span className="byt-value byt-value-highlight">
              {ipInfo
                ? `${ipInfo.latitude}, ${ipInfo.longitude}`
                : "—"}
            </span>
          </div>
        </div>

        {/* Threat Assessment */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Threat Level</span>
            <span className="byt-badge">LOW</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">VPN/Proxy</span>
            <span className="byt-value byt-value-highlight">
              Not Detected
            </span>
          </div>
          <div className="byt-row">
            <span className="byt-label">TOR Node</span>
            <span className="byt-value byt-value-highlight">
              Not Detected
            </span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Bot Score</span>
            <span className="byt-value byt-value-highlight">0.12 / 1.0</span>
          </div>
          <div className="mt-3">
            <div className="byt-threat-bar">
              <div className="byt-threat-fill" style={{ width: "18%" }} />
            </div>
            <div className="flex justify-between mt-1">
              {["LOW", "MED", "HIGH", "CRIT"].map((l, i) => (
                <span
                  key={l}
                  className="text-[8px] tracking-[1px]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: i === 0 ? "#00ff88" : "var(--byt-dim)",
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Network Card */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Network</span>
            <span className="byt-badge">SYS</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Protocol</span>
            <span className="byt-value">HTTPS/TLS 1.3</span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Platform</span>
            <span className="byt-value">
              {typeof navigator !== "undefined"
                ? navigator.platform || "Unknown"
                : "—"}
            </span>
          </div>
          <div className="byt-row">
            <span className="byt-label">Screen</span>
            <span className="byt-value">
              {typeof screen !== "undefined"
                ? `${screen.width}×${screen.height}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════ GLOBE CENTER ═══════════ */}
      <div className="byt-globe-wrap" ref={containerRef} onClick={handleContainerClick}>
        <Globe
          ref={globeRef}
          width={
            containerRef.current?.clientWidth ||
            (typeof window !== "undefined" ? window.innerWidth - 612 : 700)
          }
          height={
            containerRef.current?.clientHeight ||
            (typeof window !== "undefined" ? window.innerHeight - 84 : 600)
          }
          globeImageUrl={EARTH_IMG}
          backgroundColor="rgba(0,0,0,0)"
          pointsData={points}
          pointLat={(d: any) => d.lat}
          pointLng={(d: any) => d.lng}
          pointColor={(d: any) => d.color}
          pointAltitude={0.005}
          pointRadius={0.03}
          arcsData={arcsData}
          arcStartLat={(d: any) => d.startLat}
          arcStartLng={(d: any) => d.startLng}
          arcEndLat={(d: any) => d.endLat}
          arcEndLng={(d: any) => d.endLng}
          arcColor={(d: any) => d.color}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          arcStroke={0.5}
          atmosphereColor="#00ff88"
          atmosphereAltitude={0.2}
          showGlobe={true}
          showAtmosphere={true}
          animateIn={true}
        />

        {/* Glow pulse at pin */}
        {points.length > 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#00ff88] blur-[14px] opacity-60 animate-pulse pointer-events-none" />
        )}

        {/* Crosshair */}
        <div className="byt-crosshair">
          <div
            className="absolute inset-0 border border-[rgba(0,255,136,0.08)] rounded-full anim-crosshair-spin"
            style={{}}
          >
            <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00ff88]" />
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[rgba(0,255,136,0.1)]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[rgba(0,255,136,0.1)]" />
        </div>

        {/* Hint overlay */}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div
              className="py-2 px-4 bg-black/40 text-[12px]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--byt-dim)",
                border: "1px solid var(--byt-border)",
              }}
            >
              Click GET IP & REVEAL to initialize
            </div>
          </div>
        )}
      </div>

      {/* Coord display */}
      <div className="byt-coords">
        <span style={{ color: "#00ff88" }}>
          {ipInfo?.latitude?.toFixed(3) ?? "0.000"}°
        </span>{" "}
        LAT &nbsp;·&nbsp;{" "}
        <span style={{ color: "#00ff88" }}>
          {ipInfo?.longitude?.toFixed(3) ?? "0.000"}°
        </span>{" "}
        LNG
      </div>

      {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
      <div className="byt-sidebar byt-sidebar-right">
        {/* Analytics */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Analytics</span>
            <span className="byt-badge">24H</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { n: "1,247", l: "Connections", c: "↑ 12.4%" },
              { n: "38", l: "Threats", c: "↑ 3.1%", down: true },
              { n: "64", l: "Countries", c: "↑ 2" },
              { n: "12", l: "Blocked", c: "— 0%" },
            ].map((s) => (
              <div key={s.l} className="byt-stat">
                <div className="byt-stat-number">{s.n}</div>
                <div className="byt-stat-label">{s.l}</div>
                <div
                  className="mt-0.5 text-[9px]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: s.down ? "#ff3366" : "#00ff88",
                  }}
                >
                  {s.c}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Traffic Flow</span>
            <span className="byt-badge">LIVE</span>
          </div>
          <div className="flex items-end gap-[2px] h-10 mt-2">
            {chartBars.map((h, i) => (
              <div
                key={i}
                className={`byt-chart-bar ${i > 18 ? "byt-chart-bar-active" : ""}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Live Feed</span>
            <span className="byt-badge">{feedCount}</span>
          </div>
          <div className="max-h-[180px] overflow-y-auto">
            {logEntries.map((entry) => (
              <div key={entry.id} className="byt-log-entry">
                <div
                  className="byt-log-dot"
                  style={{
                    background:
                      entry.status === "safe"
                        ? "#00ff88"
                        : entry.status === "warn"
                        ? "#ffaa00"
                        : "#ff3366",
                  }}
                />
                <span style={{ color: "var(--byt-text)" }}>
                  {entry.ip}
                </span>
                <span
                  className="ml-auto"
                  style={{ color: "var(--byt-dim)" }}
                >
                  {entry.loc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Origins */}
        <div className="byt-panel p-4">
          <div className="byt-panel-header">
            <span className="byt-panel-title">Top Origins</span>
            <span className="byt-badge">GEO</span>
          </div>
          {TOP_ORIGINS.map((o) => (
            <div key={o.country} className="mb-2.5">
              <div className="flex justify-between mb-1">
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--byt-text)",
                  }}
                >
                  {o.flag} {o.country}
                </span>
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#00ff88",
                  }}
                >
                  {o.pct}%
                </span>
              </div>
              <div className="byt-progress-track">
                <div
                  className="byt-progress-fill"
                  style={{ width: `${o.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Server Message (Auth Response) - shows after IP reveal */}
        {showAuthMessage && authResponse?.message && (
          <div className="byt-server-msg p-4 anim-fade-up">
            <div className="byt-panel-header">
              <span
                className="byt-panel-title"
                style={{ color: "#ff3366" }}
              >
                Server Response
              </span>
              <span className="byt-badge byt-badge-danger">
                {authResponse?.type?.toUpperCase() || "MSG"}
              </span>
            </div>
            <div
              className="leading-[1.6]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
              }}
            >
              {messageLines.map((ln, idx) => (
                <div
                  key={idx}
                  className="mb-1"
                  style={{
                    color:
                      ln.includes("Error") || ln.includes("unable") || ln.includes("Unable")
                        ? "#ff3366"
                        : ln.includes("ok") || ln.includes("Access")
                        ? "#00ff88"
                        : ln.includes("Buy") || ln.includes("antidetect") || ln.includes("Message")
                        ? "#ffaa00"
                        : "var(--byt-text)",
                  }}
                >
                  {ln}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ BOTTOM BAR ═══════════ */}
      <div className="byt-bottombar">
        <div className="flex gap-6">
          {[
            { l: "NODES", v: "8" },
            { l: "LATENCY", v: `${latency}ms` },
            { l: "PACKETS", v: packets.toLocaleString() },
            { l: "UPTIME", v: uptime },
          ].map((s) => (
            <span
              key={s.l}
              className="text-[9px] tracking-[1px]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--byt-dim)",
              }}
            >
              {s.l}:{" "}
              <span style={{ color: "#00ff88" }}>{s.v}</span>
            </span>
          ))}
        </div>
        <span
          className="text-[9px] tracking-[1px]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--byt-dim)",
          }}
        >
          BYTRON INTELLIGENCE v4.2 · ENCRYPTED
        </span>
      </div>
    </div>
  );
}
