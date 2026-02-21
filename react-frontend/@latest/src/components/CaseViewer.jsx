import React from "react";

/**
 * CaseViewer
 * Props:
 * - match: { registeredCaseId, publicCaseId, details: { name, mobile, age, last_seen, birth_marks } }
 *
 * Simple responsive two-column card: details on left, image on right.
 */
export default function CaseViewer({ match }) {
  const { registeredCaseId, publicCaseId, details = {} } = match;

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2">{details.name || "Unnamed"}</h3>

          <ul className="text-gray-700 space-y-1">
            <li>
              <strong>Mobile:</strong> {details.mobile ?? "—"}
            </li>
            <li>
              <strong>Age:</strong> {details.age ?? "—"}
            </li>
            <li>
              <strong>Last Seen:</strong> {details.last_seen ?? "—"}
            </li>
            <li>
              <strong>Birth marks:</strong> {details.birth_marks ?? "—"}
            </li>
          </ul>

          <div className="mt-4 text-sm text-gray-500">
            <div>Registered ID: <span className="font-mono">{registeredCaseId}</span></div>
            <div>Public Case ID: <span className="font-mono">{publicCaseId}</span></div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <img
            src={`/resources/${encodeURIComponent(registeredCaseId)}.jpg`}
            alt={details.name || "Case image"}
            className="max-w-full h-auto rounded object-contain shadow-sm"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/placeholder.png"; // provide a placeholder path in your app
            }}
          />
        </div>
      </div>
    </section>
  );
}