import { useEffect, useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useUserAuth } from "./UserAuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { API_BASE_URL } from "../config.js";
export default function UserDashboard() {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  /** Per-case match API response (face match or private attribute match). */
  const [matchesByCaseId, setMatchesByCaseId] = useState({});
  const [casesError, setCasesError] = useState("");
  const navigate = useNavigate();
  const handleViewCase = (caseId) => {
    if (!caseId || caseId === "undefined") return;
    navigate(`/casedetails/${caseId}`);
  };
  // ✅ Hook must be at top level
  const { user } = useUserAuth();
  const userToken = user?.token;
  const handleViewMatches = (caseItem) => {
    const md = matchesByCaseId[caseItem.id];
    if (!md) {
      toast.error("Run “Check for Match” on this case first.");
      return;
    }
    navigate(`/matched/${caseItem.id}`, {
      state: {
        matchData: md,
        caseType: caseItem.case_type || "registered",
      },
    });
  };
  useEffect(() => {
    async function fetchCases() {
      try {
        setCasesError("");
        const res = await fetch(`${API_BASE_URL}/cases`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            (data && (data.detail || data.error || data.message)) ||
            `Failed to fetch cases (HTTP ${res.status})`;
          setCases([]);
          setCasesError(msg);
          return;
        }
        if (!Array.isArray(data)) {
          setCases([]);
          setCasesError("Unexpected response while loading cases.");
          return;
        }
        setCases(data);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setCases([]);
        setCasesError(err?.message || "Failed to fetch cases.");
      }
    }

    if (userToken) fetchCases(); // only fetch if token exists
  }, [userToken]); // dependency: run effect when token changes
  async function handleCheckMatch(caseId) {
    setLoadingId(caseId);
    try {
      const current = cases.find((c) => c.id === caseId);
      let res;
      if (current?.case_type === "private") {
        res = await fetch(`${API_BASE_URL}/match-private/${encodeURIComponent(caseId)}`);
      } else {
        res = await fetch(`${API_BASE_URL}/match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          }, // send case ID in body
          body: JSON.stringify({ registeredId: caseId }),
        });
      }

      const data = await res.json();
      console.log("Match response data:", data);
      const normalized = {
        ...data,
        registeredId: data.registeredId || caseId,
      };
      setMatchesByCaseId((prev) => ({ ...prev, [caseId]: normalized }));

      if (data.matched) {
        toast.success(`Match found!`);
      } else {
        toast.error("No match found for this case.");
      }

      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId ? { ...c, matchFound: data.matched } : c
        )
      );
    } catch (err) {
      console.error("Match check error:", err);
    } finally {
      setLoadingId(null);
    }
  }

  const activeMatchCase = useMemo(
    () => (loadingId ? cases.find((c) => c.id === loadingId) : null),
    [loadingId, cases]
  );

  const filteredCases = useMemo(() => {
    const list = Array.isArray(cases) ? cases : [];
    if (!searchQuery.trim()) return list;
    const fuse = new Fuse(cases, {
      keys: ["name", "id", "last_seen", "status"],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });
    return fuse.search(searchQuery.trim()).map((r) => r.item);
  }, [cases, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Loader
        open={Boolean(loadingId)}
        mode="overlay"
        activeCaseType={activeMatchCase?.case_type ?? null}
      />
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Your Cases</h2>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by name, case ID, last seen, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        />
      </div>

      {casesError ? (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {casesError}
        </div>
      ) : null}

      {Array.isArray(filteredCases) && filteredCases.map(c => (
        <div
          key={c.id}
          className=" shadow rounded-2xl p-4 mb-4 flex justify-between items-center border"
        >
          <div>
            <p className="text-lg font-bold">CASE ID : {c.id}</p>
            {c.case_type === "private" && (
              <p className="text-xs font-semibold text-purple-700">PRIVATE (NO IMAGE)</p>
            )}
            <p className="text-md font-medium">NAME : {c.name}</p>
            <p className="text-md font-medium">LAST SEEN AT : {c.last_seen}</p>
            
          </div>

          <div>
            {c.status === "NF" && (
              <button
                onClick={() => handleCheckMatch(c.id)}
                disabled={loadingId === c.id}
                className={`px-4 py-2 rounded-xl text-white 
                  ${loadingId === c.id ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}
                `}
              >
                {loadingId === c.id ? "Checking..." : "Check for Match"}
              </button>
            )}
            <button
              onClick={() => handleViewCase(c.id)}
              className="ml-3 mt-5 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-green-700"
            >
              View Details
            </button>
            {c.matchFound && (
              <button
                type="button"
                onClick={() => handleViewMatches(c)}
                className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 mt-4"
              >
                View matches
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
