"use client";
import React, { useState } from "react";
import AuthGate from "./components/AuthGate";
import HackerGlobe from "./components/HackerGlobe";

export default function Page() {
  const [authResponse, setAuthResponse] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#040810] text-white">
      {!authResponse?.ok ? (
        <AuthGate onSuccess={(res: any) => setAuthResponse(res)} />
      ) : (
        <HackerGlobe authResponse={authResponse} />
      )}
    </div>
  );
}
