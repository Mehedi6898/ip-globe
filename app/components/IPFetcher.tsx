"use client";
import { useState } from "react";
import MapView from "./MapView";

export default function IPFetcher() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getIP = async () => {
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
      const ipData = await ipRes.json();

      const locRes = await fetch(`https://ipapi.co/${ipData.ip}/json/`, { cache: "no-store" });
      const json = await locRes.json();

      setData(json);
      setError(null);
    } catch (err) {
      setError("Unable to fetch IP or location data.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🌐 IP Location Tracker</h1>

      <div className="bg-gray-800/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-700">
        <button
          onClick={getIP}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition mb-4"
        >
          Get My IP 🌍
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {data && (
          <>
            <div className="mt-4 space-y-1">
              <p className="text-lg font-semibold">Your IP: {data.ip}</p>
              <p>📍 {data.city}, {data.region}, {data.country_name}</p>
              <p>💼 ISP: {data.org}</p>
            </div>

            {data.latitude && data.longitude && (
              <div className="mt-6 rounded-lg overflow-hidden border border-gray-700">
                <MapView
                  lat={data.latitude}
                  lon={data.longitude}
                  city={data.city}
                  country={data.country_name}
                />
              </div>
            )}

            <div className="mt-6 text-center space-y-2 bg-gray-800/70 p-4 rounded-lg">
              <p>
                🕒 <span className="font-semibold">Timezone:</span> {data.timezone}
              </p>
              <p>
                💰 <span className="font-semibold">Currency:</span> {data.currency}
              </p>
              {data.country_code && (
                <p>
                  🏳️ <span className="font-semibold">Flag:</span>{" "}
                  <span className="text-2xl">
                    {String.fromCodePoint(...data.country_code.split('').map(c => 127397 + c.charCodeAt(0)))}
                  </span>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
