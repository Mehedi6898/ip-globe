"use client";

import { useState } from "react";

type ValidateResult = {
  ok: boolean;
  type?: string;
  message?: string;
  error?: string;
};

export default function AuthGate({ onSuccess }: { onSuccess: (res: ValidateResult) => void }) {
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
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono">
      <div className="bg-[#050b05] border border-green-600 shadow-[0_0_40px_5px_rgba(0,255,0,0.4)] rounded-lg p-10 w-[400px] text-center">
        <h1 className="text-2xl font-bold tracking-widest mb-6 text-green-400">
          AUTHENTICATION REQUIRED
        </h1>
         <h2 className="text-2xl font-bold tracking-widest mb-6 text-green-400">
          Enter Key From @Bytron
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Access Code"
            className="bg-black text-green-300 border border-green-500 px-4 py-2 rounded w-full mb-4 focus:outline-none text-center tracking-[0.15em] placeholder-green-700"
          />
          <button
            disabled={loading}
            type="submit"
            className="bg-green-700 hover:bg-green-600 transition-all px-6 py-2 rounded text-black font-bold shadow-[0_0_15px_rgba(0,255,0,0.6)]"
          >
            {loading ? "VERIFYING..." : "ENTER"}
          </button>
          {error && <p className="mt-3 text-red-500 font-mono text-sm">{error}</p>}
        </form>

        <div className="mt-8 text-left text-sm leading-6">
          <p className="text-green-400">{">"} SYSTEM SECURED</p>
          <p className="text-green-400">{">"} ENTER AUTH CODE TO PROCEED</p>
          <p className="text-green-400">{">"} AWAITING INPUT...</p>
        </div>
      </div>
    </div>
  );
}

