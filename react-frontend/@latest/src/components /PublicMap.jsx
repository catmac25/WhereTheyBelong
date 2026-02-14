import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import rome_map from "../assets/rome_map.jpg"
const PublicMap = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const lastSeen = state?.lastSeen; // last_seen location from matched data
    const [dataLoaded, setDataLoaded] = useState(false);
    const [userLoc, setUserLoc] = useState(null);
    const [destLoc, setDestLoc] = useState(null);
    const [route, setRoute] = useState(null);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error("Location denied:", err)
        );
    }, []);

    useEffect(() => {
        if (!lastSeen) return;

        async function geocodeLocation() {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/geocode?q=${encodeURIComponent(lastSeen)}`
                );
                const data = await res.json();
                if (data.length > 0) {
                    setDestLoc({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                    });
                    setDataLoaded(true);
                }
            } catch (err) {
                console.error("Geocoding error:", err);
            }
        }

        geocodeLocation();
    }, [lastSeen]);

    // Fetch route
    useEffect(() => {
        if (!userLoc || !destLoc) return;

        async function fetchRoute() {
            try {
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${destLoc.lng},${destLoc.lat}?overview=full&geometries=geojson`
                );
                const data = await res.json();
                const points = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                setRoute(points);
                setDistance(data.routes[0].distance / 1000);
                setDuration(data.routes[0].duration / 60);
            } catch (err) {
                console.error("Route fetch error:", err);
            }
        }

        fetchRoute();
    }, [userLoc, destLoc]);

    if (!lastSeen) return <p className="text-center mt-10">No location provided</p>;
    return (<div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Distance & Duration */}
        {distance && duration && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-md">
                <p className="dark:text-black"><strong>Shortest Distance:</strong> {distance.toFixed(2)} km</p>
                <p className="dark:text-black"> <strong>Estimated Travel Time:</strong> {duration.toFixed(1)} mins</p>
            </div>
        )}

        {/* Map */}
        <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
            {dataLoaded ? (
                destLoc && (
                    <MapContainer
                        center={[destLoc.lat, destLoc.lng]}
                        zoom={13}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {userLoc && (
                            <Marker position={[userLoc.lat, userLoc.lng]}>
                                <Popup>Your Location</Popup>
                            </Marker>
                        )}

                        <Marker position={[destLoc.lat, destLoc.lng]}>
                            <Popup>Destination</Popup>
                        </Marker>

                        {route && <Polyline positions={route} color="blue" />}
                    </MapContainer>
                )
            ) : (
                <img src={rome_map} className="w-full h-full" />
            )}
        </div>

    </div>
    )
}

export default PublicMap