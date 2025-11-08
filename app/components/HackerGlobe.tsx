"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

type GlobeType = ReturnType<typeof Globe>;

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
};

type AuthResponse = {
  ok?: boolean;
  type?: string;
  message?: string;
};

export default function HackerGlobe({ authResponse }: { authResponse?: AuthResponse }) {
  const globeRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(false);

  // Controls when to reveal the auth message (we show only after Get IP completes)
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  // Detailed earth texture
  const EARTH_IMG =
    "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg";

  async function fetchIP() {
    try {
      setBusy(true);
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("ipapi failed");
      const json = await res.json();
      const info: IpInfo = {
        ip: json.ip,
        city: json.city,
        region: json.region,
        country_name: json.country_name,
        latitude: Number(json.latitude),
        longitude: Number(json.longitude),
        org: json.org,
        timezone: json.timezone,
      };
      setIpInfo(info);
      return info;
    } catch {
      try {
        const res2 = await fetch("https://ipwhois.app/json/");
        const json2 = await res2.json();
        const info: IpInfo = {
          ip: json2.ip,
          city: json2.city,
          region: json2.region,
          country_name: json2.country,
          latitude: Number(json2.latitude),
          longitude: Number(json2.longitude),
          org: json2.org,
          timezone: json2.timezone,
        };
        setIpInfo(info);
        return info;
      } catch (err) {
        alert("Failed to get IP/location. Try again or use a different API.");
        console.error(err);
        setBusy(false);
        return null;
      }
    }
  }

  function getLocalTime(tz?: string) {
    if (!tz) return "Unknown";
    try {
      return new Date().toLocaleString("en-GB", {
        hour12: false,
        timeZone: tz,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  }

  async function handleGetIp() {
    if (busy) return;
    setShowAuthMessage(false); // make sure it's hidden until location is fetched
    const info = await fetchIP();
    if (!info) return;
    setActive(true);

    const lat = Number(info.latitude ?? 0);
    const lng = Number(info.longitude ?? 0);
    // tight/neon small pin for more accurate appearance
    setPoints([
      {
        lat,
        lng,
        size: 0.03,
        color: "rgba(0,255,120,0.95)",
        label: `${info.city ?? ""}, ${info.country_name ?? ""}`,
      },
    ]);

    // slight delay so globe and controls can animate
    setTimeout(() => {
      const g = globeRef.current as unknown as GlobeType;

      if (!g) {
        setBusy(false);
        setShowAuthMessage(true); // fallback show message if globe missing
        return;
      }

      const controls = g.controls();
      if (controls) {
        controls.enableZoom = true;
        controls.enablePan = true;
      }

      // Spin-in animation
      if (g.controls()) {
        g.controls().autoRotate = true;
        g.controls().autoRotateSpeed = 0.9;
      }

      // Zoom to location with a comfortable altitude
      const altitude = 0.45; // adjust to zoom level you like
      // animate camera to lat/lng
      g.pointOfView({ lat, lng, altitude }, 1600);

      // After globe locks, stop rotation and reveal auth message
      setTimeout(() => {
        if (g.controls()) g.controls().autoRotate = false;
        setBusy(false);
        // show the auth text (the user's requested behavior)
        setShowAuthMessage(true);
      }, 2000);
    }, 300);
  }

  useEffect(() => {
    const g = globeRef.current as any;
    if (!g) return;

    // initial passive spin, no zoom / pan
    const c = g.controls();
    if (c) {
      c.autoRotate = true;
      c.autoRotateSpeed = 0.15;
      c.enableZoom = false;
      c.enablePan = false;
    }

    // initial framing of globe
    g.pointOfView({ lat: 20, lng: 100, altitude: 2 }, 0);
  }, []);

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

  // Turn the server-provided message into lines and safe render
  const messageLines = (authResponse?.message || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  return (
    <div className="w-full flex flex-col items-center text-white px-4">
      <div className="max-w-6xl w-full">
        {/* Button */}
        <div className="flex items-center justify-center mt-6">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow"
            onClick={handleGetIp}
            disabled={busy}
          >
            {busy ? "Locating..." : "Get IP & Reveal"}
          </button>
        </div>

        {/* IP Info */}
        <h2 className="text-center mt-7 text-3xl font-extrabold">
          {ipInfo?.ip ? (
            <>
              Your IP: <span className="text-green-300">{ipInfo.ip}</span>
            </>
          ) : (
            "Awaiting IP..."
          )}
        </h2>

        <p className="text-center mt-2 text-lg text-gray-300">
          {ipInfo
            ? `${ipInfo.city ?? ""} — ${ipInfo.region ?? ""} • ${
                ipInfo.country_name ?? ""
              }`
            : ""}
        </p>

        {/* Main Content */}
        <div className="relative mt-8 rounded-xl border border-transparent/10 p-6">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Globe Section */}
            <div className="col-span-12 md:col-span-8">
              <div
                ref={containerRef}
                onClick={handleContainerClick}
                className={`relative bg-[#071122] rounded-xl h-[560px] overflow-hidden border border-green-700/40 ${
                  active ? "ring-2 ring-green-600/30" : "opacity-95"
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "85%",
                    height: "85%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Globe
                    ref={globeRef}
                    width={containerRef.current?.clientWidth || 700}
                    height={containerRef.current?.clientHeight || 700}
                    globeImageUrl={EARTH_IMG}
                    backgroundColor="rgba(0,0,0,0)"
                    pointsData={points}
                    pointLat={(d: any) => d.lat}
                    pointLng={(d: any) => d.lng}
                    pointColor={(d: any) => d.color}
                    pointAltitude={0.005}
                    pointRadius={0.03}
                    atmosphereColor="#00ff99"
                    atmosphereAltitude={0.25}
                    showGlobe={true}
                    showAtmosphere={true}
                    animateIn={true}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </div>

                {/* Neon glow pulse at the pin (if present) */}
                {points.length > 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-400 blur-[10px] opacity-70 animate-pulse pointer-events-none"></div>
                )}

                {!active && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-sm text-gray-400 bg-black/30 py-2 px-4 rounded-md">
                      Click inside to enable globe controls
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-[#071722] border border-green-800/50 rounded-lg p-5 text-green-200">
                <h3 className="text-xl font-bold text-green-300 mb-2">
                  Target Info
                </h3>

                <div style={{ fontFamily: "monospace" }}>
                  <p className="text-green-400">
                    IP: <span className="text-white">{ipInfo?.ip ?? "—"}</span>
                  </p>
                  <p className="mt-2 text-green-400">
                    Location:{" "}
                    <span className="text-white">
                      {ipInfo
                        ? `${ipInfo.city ?? ""}, ${ipInfo.region ?? ""}, ${
                            ipInfo.country_name ?? ""
                          }`
                        : "—"}
                    </span>
                  </p>
                  <p className="mt-2 text-green-400">
                    Carrier:{" "}
                    <span className="text-white">{ipInfo?.org ?? "—"}</span>
                  </p>
                  <p className="mt-2 text-green-400">
                    Timezone:{" "}
                    <span className="text-white">{ipInfo?.timezone ?? "—"}</span>
                  </p>
                  <p className="mt-2 text-green-400">
                    Local time:{" "}
                    <span className="text-white">
                      {getLocalTime(ipInfo?.timezone)}
                    </span>
                  </p>
                  <p className="mt-2 text-green-400">
                    Lat / Lng:{" "}
                    <span className="text-white">
                      {ipInfo?.latitude ?? "—"}, {ipInfo?.longitude ?? "—"}
                    </span>
                  </p>

                  <div className="mt-4 text-left">
                    <div className="bg-black/30 p-3 rounded-md text-green-200 text-sm">
                      <div>Probe log:</div>
                      <div className="mt-1 text-xs text-green-400">
                        {ipInfo ? "Location fetched" : "No data yet"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* new: show authResponse message here, but only after user clicks "Get IP" and the globe is locked */}
              {showAuthMessage && authResponse?.message && (
                <div className="mt-4 bg-black/30 p-3 rounded-md text-green-300 text-sm border border-green-700/40">
                  <div className="text-green-400/90">Access Status:</div>

                  <div
                    className="mt-2 text-green-200 font-semibold whitespace-pre-line"
                    style={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-line",
                      lineHeight: 1.4,
                    }}
                  >
                    {/* render the message lines with small bullet char for style */}
                    {messageLines.map((ln, idx) => (
                      <div key={idx} className="mb-1">
                        {ln}
                        {idx < messageLines.length - 1 ? "\n" : ""}
                      </div>
                    ))}
                  </div>

                  {authResponse?.type && (
                    <div className="text-xs mt-2 text-green-400/70">
                      Code Type: {authResponse.type.toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 p-3 rounded-md bg-black/20 border border-green-800/50 text-green-400 text-sm">
                Click <b>Get IP & Reveal</b> to spin the globe and drop a neon
                pin at the detected location.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


