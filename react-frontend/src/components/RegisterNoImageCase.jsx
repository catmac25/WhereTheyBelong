import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useUserAuth } from './UserAuthContext';
import AttributeScanAnimation, {
  buildAttributeChips,
} from './AttributeScanAnimation';
import { API_BASE_URL, PYTHON_API_URL } from '../config.js';

export default function RegisterNoImageCase() {
  const { user } = useUserAuth();
  const userToken = user?.token || localStorage.getItem('userToken');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [matches, setMatches] = useState(null);

  const [scanOpen, setScanOpen] = useState(false);
  const [scanChips, setScanChips] = useState([]);
  const [scanSpeed, setScanSpeed] = useState('realistic'); // 'fast' | 'realistic'
  const formSnapshotRef = useRef(null);
  const registrationOkRef = useRef(false);

  const [form, setForm] = useState({
    name: '',
    fathers_name: '',
    age: 10,
    gender: '',
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
    complainant_phone: '',
    tattoos: '',
    piercings: '',
    dental: '',
    spectacles: '',
    hair_type: '',
    hair_length: '',
    blood_group: '',
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        complainant_name: user.name || '',
        complainant_phone: user.email || '',
      }));
    }
  }, [user]);

  const canSubmit = useMemo(() => {
    const g = String(form.gender || '').trim();
    return Boolean(
      form.name &&
        String(form.age) &&
        g &&
        ['Male', 'Female', 'Prefer not to say'].includes(g)
    );
  }, [form.name, form.age, form.gender]);

  /** Pass `snapshot` when registering from the scan animation (form may already be reset). */
  async function registerCaseNoImage(snapshot = form) {
    const f = snapshot;
    const formData = new FormData();

    formData.append('name', f.name);
    formData.append('age', Number(f.age));
    formData.append('gender', String(f.gender || '').trim());
    formData.append('fathers_name', f.fathers_name || '');
    formData.append('address', f.address || '');
    formData.append('adhaar_card', f.adhaar_card || '');
    formData.append('height', f.height || 0.0);
    formData.append('weight', f.weight || 0.0);
    formData.append('built', f.built || '');
    formData.append('complainant_name', f.complainant_name || '');
    formData.append('mobile_number', f.mobile_number || '');
    formData.append('birthmarks', f.birthmarks || '');
    formData.append('district', f.district || '');
    formData.append('state', f.state || '');
    formData.append('last_seen', f.last_seen || '');

    formData.append('tattoos', f.tattoos || '');
    formData.append('piercings', f.piercings || '');
    formData.append('dental', f.dental || '');
    formData.append('spectacles', f.spectacles || '');
    formData.append('hair_type', f.hair_type || '');
    formData.append('hair_length', f.hair_length || '');
    formData.append('blood_group', f.blood_group || '');

    const res = await fetch(`${API_BASE_URL}/register-no-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Server Response (no-image):', text);
      throw new Error(text);
    }

    return res.json();
  }

  const runScanPipeline = useCallback(async () => {
    const snap = formSnapshotRef.current;
    if (!snap) throw new Error('Missing form data');

    const data = await registerCaseNoImage(snap);
    const newCaseId = data?.case_id || data?.id;
    let matched = false;
    let matches = [];

    if (newCaseId) {
      const matchRes = await fetch(`${API_BASE_URL}/match-private/${newCaseId}`);
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        matched = Boolean(matchData.matched);
        matches = Array.isArray(matchData.matches) ? matchData.matches : [];
      }
    }

    return {
      caseId: newCaseId,
      matched,
      matches,
    };
  }, [userToken]);

  function resetFormFields() {
    setForm({
      name: '',
      fathers_name: '',
      age: 10,
      gender: '',
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
      complainant_name: user?.name || '',
      complainant_phone: user?.email || '',
      tattoos: '',
      piercings: '',
      dental: '',
      spectacles: '',
      hair_type: '',
      hair_length: '',
      blood_group: '',
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    setMessage('');
    registrationOkRef.current = false;

    try {
      formSnapshotRef.current = { ...form };
      setScanChips(buildAttributeChips(formSnapshotRef.current));
      setScanOpen(true);
    } catch (err) {
      console.error('❌ No-image registration failed:', err);
      setError(err?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  }

  const handleScanAnalysisComplete = useCallback((payload) => {
    if (payload?.success && payload.caseId) {
      registrationOkRef.current = true;
      setMessage(`✅ No-image case registered! ID: ${payload.caseId}`);
      setMatches(Array.isArray(payload.matches) ? payload.matches : []);
    } else if (payload && payload.success === false) {
      setError(payload?.error || 'Registration failed');
      setMatches(null);
    }
  }, []);

  const handleScanClose = useCallback(() => {
    setScanOpen(false);
    if (registrationOkRef.current) {
      resetFormFields();
      registrationOkRef.current = false;
    }
  }, [user?.name, user?.email]);

  return (
    <div className="mx-8 my-8 max-w-4xl">
      <AttributeScanAnimation
        open={scanOpen}
        onClose={handleScanClose}
        chips={scanChips}
        speed={scanSpeed}
        runPipeline={runScanPipeline}
        onAnalysisComplete={handleScanAnalysisComplete}
      />

      <form
        onSubmit={onSubmit}
        className="rounded-xl shadow-md p-6 flex flex-col gap-4 card-surface"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            Private Case Registration
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span>Scan speed</span>
              <select
                value={scanSpeed}
                onChange={(e) => setScanSpeed(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs dark:bg-gray-800"
              >
                <option value="realistic">Realistic</option>
                <option value="fast">Fast</option>
              </select>
            </label>
            <div className="text-sm text-gray-500">
              {saving ? 'Starting…' : 'Ready'}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-200">
        This registration pathway is specially designed for women in situations where a recent photograph is unavailable or cannot be shared due to privacy concerns. The system relies on detailed descriptive information—such as identifying marks, tattoos, piercings, hair characteristics, and other distinguishing features—to support the matching process.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-200"> Although image-based identification may offer higher accuracy, this approach ensures that every case is handled with dignity, confidentiality, and meaningful consideration.</p>

        

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
            <label className="block text-xs font-medium text-gray-600">
              Father's Name
            </label>
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
              max={120}
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
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
              placeholder="Last Seen (place / landmark)"
              value={form.last_seen}
              onChange={e => setForm({ ...form, last_seen: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Height (cm)</label>
            <input
              type="number"
              placeholder="Height in cm"
              value={form.height}
              onChange={e => setForm({ ...form, height: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Weight (kg)</label>
            <input
              type="number"
              placeholder="Weight in kg"
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

          {/* New descriptive fields */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">
              Tattoos (design + body part)
            </label>
            <textarea
              placeholder="Describe tattoo designs and body locations"
              value={form.tattoos}
              onChange={e => setForm({ ...form, tattoos: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 min-h-[60px]"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">Piercings</label>
            <textarea
              placeholder="E.g., ears (double), nose, eyebrow, etc."
              value={form.piercings}
              onChange={e => setForm({ ...form, piercings: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 min-h-[60px]"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600">
              Dental details (braces, missing tooth)
            </label>
            <textarea
              placeholder="E.g., upper braces, missing front tooth, metal caps, etc."
              value={form.dental}
              onChange={e => setForm({ ...form, dental: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 min-h-[60px]"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">
              Spectacles
            </label>
            <select
              value={form.spectacles}
              onChange={e => setForm({ ...form, spectacles: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Sometimes">Sometimes</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">
              Hair Type
            </label>
            <select
              value={form.hair_type}
              onChange={e => setForm({ ...form, hair_type: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            >
              <option value="">Select</option>
              <option value="Straight">Straight</option>
              <option value="Wavy">Wavy</option>
              <option value="Curly">Curly</option>
              <option value="Coily">Coily</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">
              Hair Length
            </label>
            <select
              value={form.hair_length}
              onChange={e => setForm({ ...form, hair_length: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            >
              <option value="">Select</option>
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Long">Long</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600">
              Blood Group (optional)
            </label>
            <input
              placeholder="E.g., A+, O-, B+"
              value={form.blood_group}
              onChange={e => setForm({ ...form, blood_group: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium">
              Complainant Name
            </label>
            <input
              placeholder="Complainant Name"
              value={form.complainant_name}
              onChange={e =>
                !user && setForm({ ...form, complainant_name: e.target.value })
              }
              readOnly={!!user}
              className={`mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                user ? ' cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-medium">
              Complainant Email
            </label>
            <input
              placeholder="Complainant Email"
              value={form.complainant_phone}
              onChange={e =>
                !user && setForm({ ...form, complainant_phone: e.target.value })
              }
              readOnly={!!user}
              className={`mt-1 w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                user ? ' cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || saving || scanOpen}
              className="px-4 py-2 rounded-md dark:text-white border hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Starting…' : 'Save & analyze'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm({
                  name: '',
                  fathers_name: '',
                  age: 10,
                  gender: '',
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
                  complainant_name: user?.name || '',
                  complainant_phone: user?.email || '',
                  tattoos: '',
                  piercings: '',
                  dental: '',
                  spectacles: '',
                  hair_type: '',
                  hair_length: '',
                  blood_group: '',
                });
                setMessage('');
                setError('');
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

      {/* Matches Section */}
      {matches !== null && (
        <div className="mt-8 rounded-xl shadow-md p-6 card-surface border-t-4 border-indigo-500">
          <h3 className="text-xl font-bold mb-4">Potential Matches Found</h3>
          {matches.length === 0 ? (
            <p className="text-gray-500">No matching public cases found based on the provided physical attributes.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 flex gap-4 bg-white dark:bg-gray-800">
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    <img 
                      src={`${PYTHON_API_URL}${match.image_path}`} 
                      alt="Public Sighting" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-indigo-600 mb-1">Match Score: {match.score}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Gender:</span> {match.features.gender || 'Unknown'}</p>
                      <p><span className="font-medium">Skin Tone:</span> {match.features.skintone || 'Unknown'}</p>
                      <p><span className="font-medium">Spectacles:</span> {match.features.spectacles || 'Unknown'}</p>
                      <p><span className="font-medium">Hair Color:</span> {match.features.hair_color || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

