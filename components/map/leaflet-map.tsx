"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import { Pencil, Trash2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect, useState } from "react";
import L from "leaflet";
import type { Database } from "@/lib/supabase/database.types";
import { ISO_A3_TO_A2 } from "@/lib/country-mapping";

type TravelLog = Database["public"]["Tables"]["travel_logs"]["Row"];

interface LeafletMapProps {
    logs: TravelLog[];
    onMarkerClick?: (log: TravelLog) => void;
    onEdit?: (log: TravelLog) => void;
    onDelete?: (logId: string) => void;
}

// Component to handle map bounds
function MapBounds({ logs }: { logs: TravelLog[] }) {
    const map = useMap();

    useEffect(() => {
        if (logs.length > 0) {
            const bounds = L.latLngBounds(logs.map(log => [Number(log.latitude), Number(log.longitude)]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [logs, map]);

    return null;
}

// Custom Premium Icon
const customIcon = new L.DivIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: hsl(var(--chart-3)); width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px hsl(var(--chart-3)); border: 2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
});

export default function LeafletMap({ logs, onMarkerClick, onEdit, onDelete }: LeafletMapProps) {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);

    // Fetch GeoJSON data on mount
    useEffect(() => {
        fetch("/world-countries.json")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setGeoJsonData(data);
            })
            .catch((err) => console.error("LeafletMap: Failed to load map data", err));
    }, []); // Run only on mount

    // Style function for countries
    const geoJsonStyle = (feature: any) => {
        const countryIdA3 = feature.id; // ISO A3 code from GeoJSON (e.g., "USA")
        const countryIdA2 = ISO_A3_TO_A2[countryIdA3]; // Convert to A2 (e.g., "US")

        // Check if user has visited this country (case insensitive check)
        const isVisited = logs.some(log =>
            log.country_code &&
            countryIdA2 &&
            log.country_code.toUpperCase() === countryIdA2.toUpperCase()
        );

        if (isVisited) {
            // console.log(`Highlighting ${feature.properties.name}`);
        }

        return {
            fillColor: isVisited ? "#00FFCC" : "transparent", // Highlight visited
            fillOpacity: isVisited ? 0.2 : 0,
            weight: isVisited ? 1 : 0.5,
            color: isVisited ? "#00FFCC" : "#333", // Border color
            dashArray: isVisited ? "" : "3",
        };
    };

    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
            className="z-0"
        >
            {/* Dark Matter Tiles */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* GeoJSON Layer for Country Highlighting */}
            {geoJsonData && (
                <GeoJSON
                    key={`geojson-${logs.length}`} // Force re-render when logs change
                    data={geoJsonData}
                    style={geoJsonStyle}
                />
            )}

            {/* Markers */}
            {logs.map((log) => (
                <Marker
                    key={log.id}
                    position={[Number(log.latitude), Number(log.longitude)]}
                    icon={customIcon}
                    eventHandlers={{
                        click: () => onMarkerClick?.(log),
                    }}
                >
                    <Popup className="premium-popup">
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-sm mb-1">{log.location_name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                                {new Date(log.visit_date || "").toLocaleDateString()}
                            </p>
                            {log.notes && (
                                <p className="text-xs line-clamp-2 mb-3">{log.notes}</p>
                            )}

                            <div className="flex gap-2 pt-2 border-t border-border mt-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(log);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground py-1 rounded transition-colors"
                                >
                                    <Pencil size={12} /> Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.(log.id);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-destructive/10 hover:bg-destructive/20 text-destructive py-1 rounded transition-colors"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <MapBounds logs={logs} />
        </MapContainer>
    );
}
