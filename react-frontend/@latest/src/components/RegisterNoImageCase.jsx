import React, { useMemo, useState, useEffect } from 'react';
import { useUserAuth } from './UserAuthContext';

const API_URL = import.meta?.env?.VITE_API_URL ;

export default function RegisterNoImageCase() {
  const { user } = useUserAuth();
  const userToken = user?.token || localStorage.getItem('userToken');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    return Boolean(form.name && String(form.age));
  }, [form.name, form.age]);

  async function registerCaseNoImage() {
    const formData = new FormData();
    console.log('Sending JWT token (no-image):', userToken);

    formData.append('name', form.name);
    formData.append('age', Number(form.age));
    formData.append('fathers_name', form.fathers_name || '');
    formData.append('address', form.address || '');
    formData.append('adhaar_card', form.adhaar_card || '');
    formData.append('height', form.height || 0.0);
    formData.append('weight', form.weight || 0.0);
    formData.append('built', form.built || '');
    formData.append('complainant_name', form.complainant_name || '');
    formData.append('mobile_number', form.complainant_phone || '');
    formData.append('birthmarks', form.birthmarks || '');
    formData.append('district', form.district || '');
    formData.append('state', form.state || '');
    formData.append('last_seen', form.last_seen || '');

    // New descriptive fields
    formData.append('tattoos', form.tattoos || '');
    formData.append('piercings', form.piercings || '');
    formData.append('dental', form.dental || '');
    formData.append('spectacles', form.spectacles || '');
    formData.append('hair_type', form.hair_type || '');
    formData.append('hair_length', form.hair_length || '');
    formData.append('blood_group', form.blood_group || '');

    const res = await fetch(`${API_URL}/register-no-image`, {
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

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const data = await registerCaseNoImage();
      setMessage(`✅ No-image case registered! ID: ${data?.case_id || data?.id}`);
      setForm({
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
    } catch (err) {
      console.error('❌ No-image registration failed:', err);
      setError(err?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-8 my-8 max-w-4xl">
      <form
        onSubmit={onSubmit}
        className="rounded-xl shadow-md p-6 flex flex-col gap-4 card-surface"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Private Case Registration
          </h2>
          <div className="text-sm text-gray-500">
            {saving ? 'Saving…' : 'Ready'}
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
              disabled={!canSubmit || saving}
              className="px-4 py-2 rounded-md dark:text-white border hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm({
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
    </div>
  );
}

