
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import rome_map from "../assets/rome_map.jpg"

export default function ViewDetails() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [destLoc, setDestLoc] = useState(null);
  const [image, setImageUrl] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`http://localhost:4000/api/cases/${id}`);
        const data = await res.json();
        setCaseData(data);
      } catch (err) {
        console.error("Error fetching case:", err);
      }
    }
    fetchCase();
  }, [id]);
  useEffect(() => {
    async function fetchImage () {
      try{
        const res = await fetch(`http://localhost:4000/api/images/${id}`);
        const data = await res.json(); // parse JSON
        setImageUrl(data.image_path);     // 
      }catch (err){
        console.log("error fetching image");
      }
    }
    fetchImage();
  }, [id])
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Location denied:", err)
    );
  }, []);

  useEffect(() => {
    if (!caseData || !caseData.last_seen) return;

    async function geocodeLocation() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/geocode?q=${encodeURIComponent(
            caseData.last_seen
          )}`
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
  }, [caseData]);

  useEffect(() => {
    if (!userLoc || !destLoc) return;

    async function fetchRoute() {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${destLoc.lng},${destLoc.lat}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const points = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        setRoute(points);
        setDistance(data.routes[0].distance / 1000);
        setDuration(data.routes[0].duration / 60);
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    }

    fetchRoute();
  }, [userLoc, destLoc]);

  if (!caseData)
    return <p className="text-center mt-10">Loading case details...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* --- Case Card --- */}
      <div className="w-full shadow-xl rounded-2xl p-6 bg-white flex flex-col md:flex-row gap-6">

        {/* ✔️ Image Section */}
        <div className="w-full md:w-1/3">
          <img
            src={`http://localhost:8000${image}`}
            alt="Person"
            className="w-full h-64 object-cover rounded-xl shadow-md"
          />
        </div>

        {/* ✔️ Details Section */}
        <div className="w-full md:w-2/3 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-3 dark:text-black">{caseData.name}</h2>

            <p className="text-sm mb-1 dark:text-black">
              <span className="font-medium dark:text-black">Age:</span> {caseData.age}
            </p>

            <p className="text-sm mb-1 dark:text-black">
              <span className="font-medium dark:text-black">Last Seen:</span> {caseData.last_seen}
            </p>

            <p className="text-sm mt-3 dark:text-black">
              <span className="font-medium dark:text-black">Birth Marks:</span>{" "}
              {caseData.birth_marks}
            </p>
          </div>
        </div>
      </div>

      {/* --- Distance & Duration --- */}
   
      {distance && duration && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-md">
          <p className="dark:text-black">
            <strong>Shortest Distance:</strong> {distance.toFixed(2)} km
          </p>
          <p className="dark:text-black">
            <strong>Estimated Travel Time:</strong> {duration.toFixed(1)} mins
          </p>
        </div>
      )}

      {/* --- Map --- */}
      <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
       (dataLoaded && 
        {destLoc && (
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
              <Popup>Destination: {caseData.name}</Popup>
            </Marker>

            {route && <Polyline positions={route} color="blue" />}
          </MapContainer>
        )})else (
          <img src={rome_map} className="w-full h-full"/>
        )
      </div>
    </div>
  );
}
