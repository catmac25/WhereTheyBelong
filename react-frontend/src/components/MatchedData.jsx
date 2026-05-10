import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, PYTHON_API_URL } from "../config.js";

/**
 * Shows registered/private case vs public sighting matches.
 * Expects navigation state from UserDashboard: { matchData, caseType }
 * matchData should include registeredId + publicIds (or matches[] for private API).
 */
export default function MatchedData() {
  const { id: routeCaseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const matchData = state?.matchData;
  const caseType = state?.caseType || "registered";

  const registeredId = matchData?.registeredId || routeCaseId;

  const publicIds = useMemo(() => {
    if (!matchData) return [];
    if (Array.isArray(matchData.publicIds) && matchData.publicIds.length > 0) {
      return matchData.publicIds.map(String);
    }
    if (Array.isArray(matchData.matches)) {
      return matchData.matches
        .map((m) => m.public_id)
        .filter(Boolean)
        .map(String);
    }
    return [];
  }, [matchData]);

  const [publicDataList, setPublicDataList] = useState([]);
  const [registeredData, setRegisteredData] = useState(null);
  const [regImagePath, setRegImagePath] = useState(null);
  const [publicImages, setPublicImages] = useState({});

  useEffect(() => {
    if (!publicIds.length) {
      setPublicDataList([]);
      return;
    }
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          publicIds.map((pid) =>
            fetch(`${API_BASE_URL}/public/${pid}`).then((res) => {
              if (!res.ok) throw new Error(`public ${pid}`);
              return res.json();
            })
          )
        );
        setPublicDataList(results);
      } catch (err) {
        console.error("Error fetching public data:", err);
        setPublicDataList([]);
      }
    };
    fetchAll();
  }, [publicIds.join(",")]);

  useEffect(() => {
    if (!registeredId || registeredId === "undefined") {
      setRegisteredData(null);
      return;
    }
    const fetchRegisteredDetails = async () => {
      try {
        const resp = await fetch(
          `${API_BASE_URL}/cases/${encodeURIComponent(registeredId)}`
        );
        if (!resp.ok) {
          setRegisteredData(null);
          return;
        }
        const data = await resp.json();
        setRegisteredData(data);
      } catch (err) {
        console.log(err, "error occurred");
        setRegisteredData(null);
      }
    };
    fetchRegisteredDetails();
  }, [registeredId]);

  useEffect(() => {
    if (caseType === "private" || !registeredId || registeredId === "undefined") {
      setRegImagePath(null);
      return;
    }
    async function fetchImage() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/images/${encodeURIComponent(registeredId)}`
        );
        if (!res.ok) {
          setRegImagePath(null);
          return;
        }
        const data = await res.json();
        setRegImagePath(data.image_path);
      } catch (err) {
        console.log("error fetching image");
        setRegImagePath(null);
      }
    }
    fetchImage();
  }, [registeredId, caseType]);

  useEffect(() => {
    if (!publicIds.length) {
      setPublicImages({});
      return;
    }
    const fetchPublicImages = async () => {
      try {
        const results = await Promise.all(
          publicIds.map(async (id) => {
            const res = await fetch(
              `${API_BASE_URL}/images/${encodeURIComponent(id)}`
            );
            if (!res.ok) return { id, image_path: null };
            const data = await res.json();
            return { id, image_path: data.image_path };
          })
        );
        const imagesObj = {};
        results.forEach((img) => {
          if (img.image_path) imagesObj[img.id] = img.image_path;
        });
        setPublicImages(imagesObj);
      } catch (err) {
        console.error("Error fetching public images:", err);
        setPublicImages({});
      }
    };
    fetchPublicImages();
  }, [publicIds.join(",")]);

  if (!matchData) {
    return (
      <div className="mx-10 my-8 rounded-2xl bg-amber-50 p-6 text-amber-900">
        <p className="font-medium">No match data loaded.</p>
        <p className="mt-2 text-sm text-amber-800">
          Open this page from the dashboard after running <strong>Check for Match</strong> on a
          case, or go back and try again.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-amber-200 px-4 py-2 text-sm font-medium text-amber-950"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-10 my-4 grid h-screen min-h-0 grid-cols-1 gap-4 rounded-3xl bg-gray-100 p-4 dark:bg-gray-500 lg:grid-cols-2">
      <div className="overflow-auto rounded-2xl bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-2 text-2xl font-semibold">Your case</h2>
        {caseType === "private" && (
          <p className="mb-4 text-sm font-medium text-purple-600">
            Private (no-image) case — no reference photo
          </p>
        )}

        <div className="mb-6 h-40 w-40 overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700">
          {regImagePath ? (
            <img
              className="h-full w-full object-cover"
              src={`${PYTHON_API_URL}${regImagePath}`}
              alt="Registered"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-gray-500">
              {caseType === "private" ? "No image on file" : "No image"}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <h3 className="text-lg font-semibold">Case ID</h3>
            <p className="font-mono text-sm">{registeredId}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <h3 className="text-lg font-semibold">Name</h3>
            <p>{registeredData?.name ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <h3 className="text-lg font-semibold">Age</h3>
            <p>{registeredData?.age ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <h3 className="text-lg font-semibold">Birth marks</h3>
            <p>{registeredData?.birth_marks ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <h3 className="text-lg font-semibold">Last seen</h3>
            <p>{registeredData?.last_seen ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-semibold">Public sightings matched</h2>
        {publicDataList.length === 0 ? (
          <p className="text-gray-500">No public records to show for this result.</p>
        ) : (
          <div className="space-y-4">
            {publicDataList.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-4 dark:border-gray-600 dark:bg-gray-700"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-300">
                  {publicImages[item.id] ? (
                    <img
                      src={`${PYTHON_API_URL}${publicImages[item.id]}`}
                      alt={`Match ${item.id}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg">Public ID: {item.id}</h3>
                  <p className="text-sm">Submitted by: {item.submitted_by ?? "—"}</p>
                  <p className="text-sm">Location: {item.location ?? "—"}</p>
                  <p className="text-sm">Birth marks: {item.birth_marks ?? "—"}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/viewmap/${item.id}`, {
                      state: { lastSeen: item.location },
                    })
                  }
                  className="rounded-2xl bg-green-700 px-4 py-2 text-white hover:bg-green-500"
                >
                  View on map
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
