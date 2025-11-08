declare module "react-leaflet" {
  import { ComponentType } from "react";
  import { MapContainerProps } from "react-leaflet";

  export const MapContainer: ComponentType<MapContainerProps & { center?: [number, number] }>;
}
