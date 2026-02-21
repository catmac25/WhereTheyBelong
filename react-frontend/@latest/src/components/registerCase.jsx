import React, { useMemo, useState, useEffect } from 'react'
import { useUserAuth } from './UserAuthContext'
const API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:4000/api'

export default function RegisterNewCase() {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { user } = useUserAuth();
  const userToken = user?.token || localStorage.getItem("userToken");
  const [form, setForm] = useState({
    name: '',
    fathers_name: '',
    age: 10,
    mobile_number: '',
    address: '',
    adhaar_card: '',
    birthmarks: '',
    last_seen: '',
    height: 0.0,
    weight: 0.0,
    built: '',
    district: '',
    state: '',
    complainant_name: '',
    complainant_phone: ''
  })
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        complainant_name: user.name || "",
        complainant_phone: user.email || "",
      }));
    }
  }, [user]);
  const canSubmit = useMemo(() => {
    return Boolean(imageFile && form.name && String(form.age))
  }, [imageFile, form.name, form.age])

  function onPickFile(e) {
    const file = e.target.files?.[0]
    setError('')
    setMessage('')
    if (!file) {
      setImageFile(null)
      setImagePreviewUrl('')
      return
    }
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreviewUrl(url)
  }
  async function registerCase() {
    const formData = new FormData();
    console.log("Sending JWT token:", userToken);

    // Append only fields FastAPI expects
    formData.append("name", form.name);
    formData.append("age", Number(form.age)); // Convert age to number
    formData.append("fathers_name", form.fathers_name || "");
    formData.append("address", form.address || "");
    formData.append("adhaar_card", form.adhaar_card || "");
    formData.append("height", form.height || 0.0);
    formData.append("weight", form.weight || 0.0);
    formData.append("built", form.built || "");
    formData.append("complainant_name", form.complainant_name || "");
    formData.append("mobile_number", form.complainant_phone || "");
    formData.append("birthmarks", form.birthmarks || "");
    formData.append("district", form.district || "");
    formData.append("state", form.state || "");
    formData.append("last_seen", form.last_seen || "");

    if (imageFile) {
      formData.append("image", imageFile); // FastAPI param name must match
    }

    const res = await fetch(`http://localhost:4000/api/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      // Give more readable error
      const text = await res.text();
      console.error("Server Response:", text);
      throw new Error(text);
    }

    return res.json();
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await registerCase();
      setMessage(`✅ Case Registered! ID: ${data?.case_id || data?.id}`);
      // reset form
      setForm({
        name: "", fathers_name: "", age: 10, mobile_number: "", address: "",
        adhaar_card: "", birthmarks: "", last_seen: "", height: 0.0, weight: 0.0, built: "", district: "", state: "",
        complainant_name: "", complainant_phone: ""
      });
      setImageFile(null);
      setImagePreviewUrl("");
    } catch (err) {
      console.error("❌ Registration failed:", err);
      setError(err?.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 420px) 1fr', gap: 26 }} className='mx-20 my-7'>

      <div className=" rounded-xl shadow-md overflow-hidden">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Image</h2>
            <div className="text-sm text-gray-500">Preview & upload</div>
          </div>

          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center cursor-pointer rounded-md border-2 border-dashed border-gray-200 p-6 hover:border-gray-300 transition"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-3" aria-hidden>
              <path d="M12 3v12" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 7l4-4 4 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="13" width="18" height="8" rx="2" stroke="#E5E7EB" strokeWidth="1.5" />
            </svg>
            <div className="text-sm text-gray-600">Click to select an image or drag & drop</div>
            <input id="file-input" type="file" accept="image/png,image/jpeg,image/jpg" onChange={onPickFile} className="sr-only" />
            <div className="text-xs text-gray-400 mt-2">PNG, JPG up to your server limit</div>
          </label>

          {imagePreviewUrl ? (
            <div style={{ marginTop: 12 }}>
              <img src={imagePreviewUrl} alt="preview" style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} />
            </div>
          ) : null}

          {!imageFile ? <div style={{ opacity: 0.8 }} className="text-sm text-gray-500">Pick an image to enable the form</div> : null}
        </div>
      </div>
      {/* Right column: Form card */}
      <form
        onSubmit={onSubmit}
        className=" rounded-xl shadow-md p-6 flex flex-col gap-4"
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Register New Case</h2>
          <div className="text-sm text-gray-500">{saving ? 'Saving…' : 'Ready'}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">Name</label>
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">Father's Name</label>
            <input
              placeholder="Father's Name"
              value={form.fathers_name}
              onChange={e => setForm({ ...form, fathers_name: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">Age</label>
            <input
              type="number"
              placeholder="Age"
              min={3}
              max={100}
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">Mobile</label>
            <input
              placeholder="Mobile Number"
              value={form.mobile_number}
              onChange={e => setForm({ ...form, mobile_number: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Address</label>
            <input
              placeholder="Address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">Adhaar Card</label>
            <input
              placeholder="Adhaar Card"
              value={form.adhaar_card}
              onChange={e => setForm({ ...form, adhaar_card: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">Birth Mark</label>
            <input
              placeholder="Birth Mark"
              value={form.birthmarks}
              onChange={e => setForm({ ...form, birthmarks: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Last Seen</label>
            <input
              placeholder="Last Seen"
              value={form.last_seen}
              onChange={e => setForm({ ...form, last_seen: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Height (cm)</label>
            <input
              type="number"
              placeholder="Height"
              value={form.height}
              onChange={e => setForm({ ...form, height: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Weight (kg)</label>
            <input
              type="number"
              placeholder="Weight"
              value={form.weight}
              onChange={e => setForm({ ...form, weight: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Body Built</label>
            <select
              value={form.built}
              onChange={e => setForm({ ...form, built: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            >
              <option value="">Select</option>
              <option value="Slim">Slim</option>
              <option value="Average">Average</option>
              <option value="Athletic">Athletic</option>
              <option value="Heavy">Heavy</option>
              <option value="Obese">Obese</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">District</label>
            <input
              placeholder="District"
              value={form.district}
              onChange={e => setForm({ ...form, district: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">State</label>
            <input
              placeholder="State"
              value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium ">Complainant Name</label>
            <input
              placeholder="Complainant Name"
              value={form.complainant_name}
              onChange={(e) =>
                !user && setForm({ ...form, complainant_name: e.target.value })
              }
              readOnly={!!user}
              className={`mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${user ? " cursor-not-allowed" : ""
                }`}
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium ">Complainant Email</label>
            <input
              placeholder="Complainant Phone"
              value={form.complainant_phone}
              onChange={(e) =>
                !user && setForm({ ...form, complainant_phone: e.target.value })
              }
              readOnly={!!user}
              className={`mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${user ? " cursor-not-allowed" : ""
                }`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="px-4 py-2 rounded-md text-white border hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm({
                  name: '', fathers_name: '', age: 10, mobile_number: '', address: '', adhaar_card: '',
                  birthmarks: '', last_seen: '', height: 0.0, weight: 0.0, built: "", district: '', state: "", complainant_name: '', complainant_phone: ''
                })
                setImageFile(null)
                setImagePreviewUrl('')
                setMessage('')
                setError('')
              }}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Reset
            </button>
          </div>

          <div className="text-right">
            {message ? <div style={{ color: 'green' }}>{message}</div> : null}
            {error ? <div style={{ color: 'red' }}>{error}</div> : null}
          </div>
        </div>
      </form>
    </div>
  )
}
