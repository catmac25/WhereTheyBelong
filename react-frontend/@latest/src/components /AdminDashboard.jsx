import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TypingText from "./typing-text";
import CountingNumber from "./CountingNumber";
import GradientText from "./GradientText";
export default function AdminDashboard() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [usercount, setUsercount] = useState(0);
  const [activecases, setActivecases] = useState(0);
  const [publiccases, setPubliccases] = useState(0);
  const [matchedcases, setMatchedCases] = useState(0);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleCheckMatch = async () => {
    setLoading(true);
    setMatches([]);
    try {
      const res = await axios.post("http://localhost:4000/api/matcha");
      if (res.data.matched && res.data.matches && res.data.matches.length > 0) {
        setMatches(res.data.matches);
        setMatchedCases(res.data.matches.length);
        console.log(res.data.matches);
        toast.success(`Yayyyy Found matches!`, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }else {
        setMatches([]);
        toast.info(" No matches found.", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (err) {
      console.error("Match error:", err?.response?.data || err.message);
      alert("❌ Error checking matches.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDashboard(true);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    async function fetchDashboardCounts() {
      try {
        const [userRes, activeRes, publicRes, matchedRes] = await Promise.all([
          fetch("http://localhost:8000/usercount"),
          fetch("http://localhost:8000/registercounter"),
          fetch("http://localhost:8000/publiccount"),
          fetch("http://localhost:8000/matchedcount"),
        ]);

        const [userData, activeData, publicData, matchedData] = await Promise.all([
          userRes.json(),
          activeRes.json(),
          publicRes.json(),
          matchedRes.json(),
        ]);
        console.log("activeData", activeData);
        setUsercount(userData.count);
        setActivecases(activeData.count.count);
        setPubliccases(publicData.count);
      
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      }
    }

    fetchDashboardCounts();
  }, []);
  if (!showDashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: "5.0rem",
            fontWeight: "bold",
            color: "#2274a5",
          }}
        >
          <TypingText text="Welcome, Admin!" speed={50} />
        </h1>
      </div>
    );
  }

  // Render your real dashboard here!
  return (
    <div style={{ padding: 32 }}>
      <div className="p-6   mx-auto">
        <h1 className="text-3xl font-bold mb-12 text-center">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
          <div className="flex flex-col items-center gap-y-6">
            <span className="text-5xl font-extrabold"></span>
            <GradientText className="text-2xl font-bold " text="Registered Users" />
            <CountingNumber number={usercount} className="text-2xl font-bold" />
          </div>
          <div className="flex flex-col items-center gap-y-6">
            <span className="text-5xl font-extrabold"></span>
            <GradientText className="text-2xl font-bold" text="Active Cases" />
            <CountingNumber number={activecases} className="text-2xl font-bold" />
          </div>
          <div className="flex flex-col items-center gap-y-6">
            <span className="text-5xl font-extrabold"></span>
            <GradientText className="text-2xl font-bold" text="Public Sightings" />
            <CountingNumber number={publiccases} className="text-2xl font-bold" />
          </div>
          <div className="flex flex-col items-center gap-y-6">
            <span className="text-5xl font-extrabold"></span>
            <GradientText className="text-2xl font-bold" text="Matched Cases" />
            <CountingNumber number={matchedcases} className="text-2xl font-bold" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full justify-center mt-12">
      <button
        onClick={handleCheckMatch}
        disabled={loading}
        className={`px-8 py-3 rounded-lg font-bold shadow-md transition-all duration-200 transform ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 text-white hover:bg-green-700 hover:scale-105"
        }`}
      >
        {loading ? "Checking..." : "Check for Match"}
      </button>
      {matches.length > 0 && (
        <div className="mt-8 w-full max-w-5xl overflow-x-auto mx-5">
          <table className="min-w-full border border-gray-300 rounded-lg ">
            <thead>
              <tr className="dark:bg-gray-300 bg-gray-200">
                <th className="py-2 px-4 border-b text-black">Registered Case</th>
                <th className="py-2 px-4 border-b text-black">Public Case(s)</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, idx) => (
                <tr key={idx} className="">
                  <td className="py-2 px-4 border-b pr-17 text-center">
                     {m.registeredId}
                  </td>
                  <td className="py-2  border-b text-center">
                    {m.publicIds.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    <ToastContainer />
    </div>
  );
}