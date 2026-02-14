import { useNotifications } from "./NotificationContext";
import {useState} from "react";
export default function MatchPage({ user = null }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]); // [{ registeredCaseId, publicCaseId, details }]
  const [info, setInfo] = useState("");
  const {addNotification} = useNotifications();
  async function handleRefresh() {
    try {
      setLoading(true);
      setInfo("Training model and checking for matches...");

      // Trigger backend training step
      await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });

      // Get matches
      const matchRes = await fetch("/api/match");
      if (!matchRes.ok) throw new Error("Match API error");
      const matchData = await matchRes.json();

      if (!matchData.status || !matchData.result || Object.keys(matchData.result).length === 0) {
        setMatches([]);
        setInfo("No match found");
        return;
      }

      // For each matched registered case id, fetch details and mark as found
      const entries = await Promise.all(
        Object.entries(matchData.result).map(async ([registeredCaseId, arr]) => {
          const publicCaseId = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;

          // Fetch case details
          const detailRes = await fetch(`/api/case/${encodeURIComponent(registeredCaseId)}`);
          const details = detailRes.ok ? await detailRes.json() : {};

          // Update found status
          await fetch("/api/update-found", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registeredCaseId, publicCaseId }),
          });

          return { registeredCaseId, publicCaseId, details };
        })
      );

      setMatches(entries);
      setInfo("");
      entries.forEach((m) => {
        addNotification(`Match found! Case number ${m.registeredCaseId}`);
      });
      
    } catch (err) {
      console.error(err);
      setInfo("Something went wrong while checking for matches.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mt-10 mb-6 gap-4">
        <h1 className="text-3xl font-bold">Check for match</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
            disabled={loading}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : null}
            Refresh
          </button>
        </div>
      </header>

      <main>
        {info ? (
          <div className="mb-6">
            <div className="rounded-md bg-blue-50 border border-blue-100 p-4 text-blue-800">{info}</div>
          </div>
        ) : null}

        {matches.length === 0 && !info && (
          <div className="text-gray-600 mb-6">Press Refresh to fetch data and train the model.</div>
        )}

        <div className="space-y-6">
          {matches.map((m) => (
            <CaseViewer key={m.registeredCaseId} match={m} />
          ))}
        </div>
      </main>
    </div>
  );
}