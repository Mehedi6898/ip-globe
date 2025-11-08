"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ fix marker icons for Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapViewProps {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

// ✅ import all react-leaflet parts in a safe dynamic way
const MapContainer: any = dynamic(() => import("react-leaflet").then((m: any) => m.MapContainer), { ssr: false });
const TileLayer: any = dynamic(() => import("react-leaflet").then((m: any) => m.TileLayer), { ssr: false });
const Marker: any = dynamic(() => import("react-leaflet").then((m: any) => m.Marker), { ssr: false });
const Popup: any = dynamic(() => import("react-leaflet").then((m: any) => m.Popup), { ssr: false });

export default function MapView({ lat, lon, city, country }: MapViewProps) {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden mt-6">
      {/* @ts-ignore - leaflet strict types are buggy */}
      <MapContainer
        center={[lat, lon]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]} icon={icon}>
          <Popup>
            📍 {city}, {country}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
