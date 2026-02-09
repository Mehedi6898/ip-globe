"use client";

import { useState } from "react";

type ValidateResult = {
  ok: boolean;
  type?: string;
  message?: string;
  error?: string;
};

export default function AuthGate({
  onSuccess,
}: {
  onSuccess: (res: ValidateResult) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data: ValidateResult = await res.json();

      if (res.ok && data.ok) {
        onSuccess(data);
      } else {
        setError(data.error || "Invalid code");
      }
    } catch (err) {
      console.error(err);
      setError("Server error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#040810] z-[1000]">
      {/* Animated grid background */}
      <div className="auth-bg-grid" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-[#00ff88] rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse-dot ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-[420px] max-w-[90vw]">
        <div
          className="relative p-12 backdrop-blur-[20px]"
          style={{
            background: "rgba(4, 12, 24, 0.85)",
            border: "1px solid rgba(0, 255, 136, 0.12)",
          }}
        >
          {/* Scan line */}
          <div className="auth-scan-line" />

          {/* Top glow line */}
          <div className="auth-top-glow" />

          {/* Logo Area */}
          <div className="text-center mb-9">
            {/* Hex Logo */}
            <div className="inline-block mb-4">
              <svg
                viewBox="0 0 60 60"
                fill="none"
                className="w-14 h-14"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(0,255,136,0.5))",
                }}
              >
                <path
                  d="M30 3L55 17V43L30 57L5 43V17L30 3Z"
                  stroke="#00ff88"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M30 12L46 21V39L30 48L14 39V21L30 12Z"
                  stroke="#00ff88"
                  strokeWidth="0.5"
                  fill="rgba(0,255,136,0.05)"
                />
                <circle cx="30" cy="30" r="6" fill="#00ff88" opacity="0.8" />
                <circle cx="30" cy="30" r="3" fill="#040810" />
              </svg>
            </div>

            {/* Title */}
            <div
              className="text-[28px] font-black tracking-[8px] text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              BYTRON
            </div>

            {/* Subtitle */}
            <div
              className="text-[10px] tracking-[3px] text-[#00ff88] mt-2 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Intelligence Platform v4.2
            </div>
          </div>

          {/* Status */}
          <div
            className="text-center mb-6 text-[11px] tracking-[2px] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "#ff3366",
            }}
          >
            ⬡ Authentication Required
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Input */}
            <div>
              <label
                className="block mb-2 text-[9px] tracking-[2px] uppercase"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "var(--byt-dim)",
                }}
              >
                Access Key
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ENTER KEY"
                className="byt-input"
                autoComplete="off"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="byt-btn" disabled={loading}>
              <span className="relative z-10">
                {loading ? "Verifying..." : "Initialize"}
              </span>
            </button>

            {/* Error */}
            {error && (
              <div
                className="text-center text-[11px] py-2 px-3"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#ff3366",
                  border: "1px solid rgba(255,51,102,0.2)",
                  background: "rgba(255,51,102,0.05)",
                }}
              >
                ✖ {error}
              </div>
            )}
          </form>

          {/* Terminal Output */}
          <div
            className="mt-6 leading-[1.8]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              color: "var(--byt-dim)",
            }}
          >
            <div>
              {">"}{" "}
              <span style={{ color: "#00ff88" }}>SYS</span> :: Secure
              connection established
            </div>
            <div>
              {">"}{" "}
              <span style={{ color: "#00ff88" }}>NET</span> :: Encryption
              layer active (AES-256)
            </div>
            <div>
              {">"}{" "}
              <span style={{ color: "#00ff88" }}>AUTH</span> :: Enter key
              from @Bytron
            </div>
            <div>
              {">"}{" "}
              <span style={{ color: "#00ff88" }}>STA</span> :: Awaiting
              input...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
