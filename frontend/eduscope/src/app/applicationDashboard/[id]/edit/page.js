'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditApplicationPage() {
    const { id } = useParams();
    const router = useRouter();

    const apiBase = useMemo(() => {
        const b = process.env.NEXT_PUBLIC_API_URL || '';
        return b.endsWith('/') ? b : `${b}/`;
    }, []);

    // Form state
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [saving, setSaving] = useState(false);

    // You can tailor these to your API’s exact fields
    const [form, setForm] = useState({
        applicant: '',           // likely an id
        grade: '',               // e.g., "Grade 7"
        extras: [],              // array of strings
        extras_other: '',        // free text
        status: '',              // if editable
    });

    // File inputs
    const [photoFile, setPhotoFile] = useState(null);
    const [birthCertFile, setBirthCertFile] = useState(null);
    const [healthRecordFile, setHealthRecordFile] = useState(null);

    // Options (adjust to your backend choices)
    const extrOptions = ['Sports', 'Art', 'Scouts', 'Music', 'Debate', 'Coding Club'];
    const gradeOptions = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];

    // Load existing application
    useEffect(() => {
        async function loadApplication() {
        try {
            setLoading(true);
            setErrorMsg('');

            const res = await fetch(`${apiBase}Application/${id}/`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to load application');

            const data = await res.json();

            // Map API -> form fields (adjust to your actual API)
            setForm({
            applicant: data.applicant_id ?? data.applicant ?? '',
            grade: data.grade ?? '',
            extras: Array.isArray(data.extras) ? data.extras : [],
            extras_other: data.extras_other ?? '',
            status: data.status ?? '',
            });

        } catch (e) {
            setErrorMsg(e.message || 'Something went wrong loading data');
        } finally {
            setLoading(false);
        }
        }
        if (id) loadApplication();
    }, [apiBase, id]);

    const onChange = (name, value) =>
        setForm(prev => ({ ...prev, [name]: value }));

    const toggleExtra = (val) => {
        setForm(prev => {
        const exists = prev.extras.includes(val);
        const next = exists ? prev.extras.filter(x => x !== val) : [...prev.extras, val];
        return { ...prev, extras: next };
        });
    };

    const onReset = () => {
        // Just reload the page’s data (simplest)
        router.refresh();
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
        const hasFiles = photoFile || birthCertFile || healthRecordFile;

        let res;
        if (hasFiles) {
            // Send multipart/form-data
            const fd = new FormData();
            fd.append('applicant', form.applicant);
            fd.append('grade', form.grade);
            fd.append('status', form.status);
            fd.append('extras_other', form.extras_other);
            // arrays typical for DRF: send each entry, or JSON-stringify based on your API
            form.extras.forEach((x) => fd.append('extras', x));

            if (photoFile) fd.append('photo', photoFile);
            if (birthCertFile) fd.append('birth_certificate', birthCertFile);
            if (healthRecordFile) fd.append('health_record', healthRecordFile);

            res = await fetch(`${apiBase}Application/${id}/`, {
            method: 'PUT', // or PATCH—match your backend
            body: fd,
            });
        } else {
            // Send JSON (PATCH) if no files changed
            const payload = {
            applicant: form.applicant,
            grade: form.grade,
            status: form.status,
            extras: form.extras,
            extras_other: form.extras_other,
            };

            res = await fetch(`${apiBase}Application/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            });
        }

        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(txt || 'Failed to save changes');
        }

        // Go back to details or list
        router.push(`/applicationDashboard/${id}`);
        } catch (e) {
        setErrorMsg(e.message || 'Failed to save changes');
        } finally {
        setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading…</div>;
    if (errorMsg) return <div className="p-6 text-red-600">Error: {errorMsg}</div>;

    return (
        <div className="p-6">
        <form
            onSubmit={onSubmit}
            className="bg-white shadow-md rounded-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border border-orange-300"
        >
            {/* Applicant Name (select) */}
            <div className="flex flex-col gap-2">
            <label className="font-semibold">Applicant Name</label>
            {/* If you have an applicants endpoint, populate options here.
                For now this is a simple text or id input. */}
            <input
                type="text"
                className="border rounded-md px-3 py-2"
                placeholder="Applicant ID or Name"
                value={form.applicant}
                onChange={(e) => onChange('applicant', e.target.value)}
                required
            />
            </div>

            {/* Applying Grade (select) */}
            <div className="flex flex-col gap-2">
            <label className="font-semibold">Applying Grade</label>
            <select
                className="border rounded-md px-3 py-2"
                value={form.grade}
                onChange={(e) => onChange('grade', e.target.value)}
                required
            >
                <option value="" disabled>Select grade</option>
                {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            </div>

            {/* Extra-curriculars (checkbox grid) */}
            <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                <label className="font-semibold">Extra-curriculars</label>
                <div className="grid grid-cols-2 gap-3">
                    {extrOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2">
                        <input
                        type="checkbox"
                        checked={form.extras.includes(opt)}
                        onChange={() => toggleExtra(opt)}
                        />
                        {opt}
                    </label>
                    ))}
                </div>
                </div>

                {/* Other */}
                <div className="flex flex-col gap-2">
                <label className="font-semibold">Other</label>
                <input
                    type="text"
                    className="border rounded-md px-3 py-2"
                    placeholder="e.g., Chess, Drama…"
                    value={form.extras_other}
                    onChange={(e) => onChange('extras_other', e.target.value)}
                />
                </div>
            </div>
            </div>

            {/* Files */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <label className="font-semibold">Applicant Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-semibold">Birth Certificate (PDF/DOC/DOCX)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setBirthCertFile(e.target.files?.[0] || null)} />
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-semibold">Health Record (PDF/DOC/DOCX)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setHealthRecordFile(e.target.files?.[0] || null)} />
            </div>
            </div>

            {/* Status (optional) */}
            <div className="md:col-span-2 flex flex-col gap-2">
            <label className="font-semibold">Status</label>
            <select
                className="border rounded-md px-3 py-2"
                value={form.status}
                onChange={(e) => onChange('status', e.target.value)}
            >
                <option value="">Select status</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
            </select>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={onReset} className="border rounded-md px-4 py-2">Reset</button>
            <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 text-white rounded-md px-4 py-2 disabled:opacity-50"
            >
                {saving ? 'Saving…' : 'Submit Application'}
            </button>
            </div>
        </form>
        </div>
    );
}
