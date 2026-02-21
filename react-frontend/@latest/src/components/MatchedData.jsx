import React, { useState, useEffect } from "react";
import { useLocation , useNavigate} from "react-router-dom";
export default function MatchedData() {
    const { state } = useLocation();
    const matchData = state?.matchData;
    const [publicDataList, setPublicDataList] = useState([]); //list of objects 
    const [registeredData, setRegisteredData] = useState(null);
    const [regId, setRegId] = useState(null);
    const [publicImages, setPublicImages] = useState({});
    const navigate = useNavigate();
    useEffect(() => {
        console.log(matchData);
        const fetchAll = async () => {
            try {
                const promises = matchData.publicIds.map(id =>
                    fetch(`http://localhost:4000/api/public/${id}`)
                        .then(res => {
                            if (!res.ok) throw new Error("Network response was not ok");
                            return res.json();
                        })
                );
                const results = await Promise.all(promises);
                setPublicDataList(results);
            } catch (err) {
                console.error("Error fetching public data:", err);
            }
        }
        fetchAll();
    }, [matchData]);
    useEffect(() => {
        const fetchRegisteredDetails = async () => {
            try {
                const resp = await fetch(`http://localhost:4000/api/cases/${matchData.registeredId}`);
                const data = await resp.json();
                setRegisteredData(data);
                console.log(registeredData);
            } catch (err) {
                console.log(err, "error occurred");
            }
        }
        fetchRegisteredDetails();
    }, [matchData])
    useEffect(() => {
        async function fetchImage() {
            try {
                const res = await fetch(`http://localhost:4000/api/images/${matchData.registeredId}`);
                const data = await res.json(); // parse JSON
                setRegId(data.image_path);     // 
            } catch (err) {
                console.log("error fetching image");
            }
        }
        fetchImage();
    }, [matchData])
    useEffect(() => {
        const fetchPublicImages = async () => {
            try {
                // Loop over publicIds and fetch images
                const promises = matchData.publicIds.map(async id => {
                    const res = await fetch(`http://localhost:4000/api/images/${id}`);
                    if (!res.ok) throw new Error(`Image not found for ${id}`);
                    const data = await res.json();
                    return { id, image_path: data.image_path };
                });

                const results = await Promise.all(promises);

                // Convert array to object for easy access
                const imagesObj = {};
                results.forEach(img => {
                    imagesObj[img.id] = img.image_path;
                });

                setPublicImages(imagesObj);
            } catch (err) {
                console.error("Error fetching public images:", err);
            }

        };
        fetchPublicImages();
    }, [matchData])
    return (
        <div className=" h-screen grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-500 mx-10 rounded-3xl">
            {/* Left: Registered Case Details */}
            <div className="bg-white rounded-2xl shadow p-6 overflow-auto dark:bg-gray-900">
                <h2 className="text-2xl font-semibold mb-4">Registered Case Details</h2>
                <div className=" bg-gray-300 rounded-2xl w-30 h-30 mb-6 "> <img className="w-full h-full object-cover rounded-xl"src={`http://localhost:8000${regId}`} /></div>
                <div className="space-y-4">
                    <div className="border p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-lg">Case ID </h3>
                        <p>{matchData.registeredId}</p>
                    </div>
                    <div className="border p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-lg">Name</h3>
                        <p>{registeredData?.name}</p>
                    </div>

                    <div className="border p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-lg">Age</h3>
                        <p>
                            {registeredData?.age}
                        </p>
                    </div>

                    <div className="border p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-lg">Birth Marks</h3>
                        <p>{registeredData?.birth_marks}</p>
                    </div>

                    <div className="border p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-lg">Last Seen</h3>
                        <p>{registeredData?.last_seen}</p>
                    </div>
                </div>
            </div>

            {/* Right: Matches Found */}
            <div className="bg-white rounded-2xl shadow p-6 overflow-auto dark:bg-gray-900">
                <h2 className="text-2xl font-semibold mb-4">Matches Found</h2>

                <div className="space-y-4">
                    {publicDataList.map((item, index) => (
                        <div className="border py-4 px-3 rounded-xl bg-gray-50 flex gap-3 items-center dark:bg-gray-700">

                            <div className="w-24 h-24 bg-gray-300 rounded-xl overflow-hidden">
                                {publicImages[item.id] ? (
                                    <img
                                        src={`http://localhost:8000${publicImages[item.id]}`}
                                        alt={`Match ${item.id}`}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm text-gray-500">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg">Match : {item.id}</h3>
                                <p>Submitted By: {item.submitted_by}</p>
                                <p>Location: {item.location}</p>
                                <p>Birth Marks : {item.birth_marks}</p>
                            </div>
                            <div>
                                <button onClick = {() => navigate(`/viewmap/${item.id}` , {
                                    state: {
                                        lastSeen: item.location
                                    }
                                })} className="h-10 w-40 bg-green-700 text-bold hover:bg-green-500 rounded-2xl text-white mr-3">View on Map</button>
                                </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
