'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Table, TableBody, TableCaption, TableCell,
    TableHead, TableHeader, TableRow,
    } from "@/components/ui/table";
    import { Button } from '@/components/ui/button';

    export default function ApplicationTable() {
    // 1) State hooks
    const [applicants, setApplicants] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // 2) Stable API base (hook must be before any conditional return)
    const base = useMemo(() => {
        const b = process.env.NEXT_PUBLIC_API_URL || '';
        return b.endsWith('/') ? b : `${b}/`;
    }, []);

    // 3) Data fetching (hook must be before any conditional return)
    useEffect(() => {
        async function loadData() {
        try {
            setLoading(true);
            setErrorMsg("");

            const [applicantsRes, applicationsRes] = await Promise.all([
            fetch(base + "Applicant/", { cache: "no-store" }),
            fetch(base + "Application/", { cache: "no-store" }),
            ]);

            if (!applicantsRes.ok) throw new Error("Failed to load applicants");
            if (!applicationsRes.ok) throw new Error("Failed to load applications");

            const [applicantsData, applicationsData] = await Promise.all([
            applicantsRes.json(),
            applicationsRes.json(),
            ]);

            setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
            setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        } catch (err) {
            setErrorMsg(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
        }
        loadData();
    }, [base]);

    // 4) Build applicant map (hook must be before any conditional return)
    const applicantById = useMemo(() => {
        const map = new Map();
        for (const a of applicants) map.set(a.id, a);
        return map;
    }, [applicants]);

    // ----- helpers (no hooks below this point) -----
    const getApplicantName = (app) => {
        const key = app.applicant_id ?? app.applicantId ?? app.applicant ?? app.ApplicantId;
        const a = key != null ? applicantById.get(key) : null;
        if (a) {
        const full = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim();
        return full || a.email || `Applicant #${a.id}`;
        }
        return app.applicant_name || '—';
    };

    const getSubmittedDate = (app) => {
        const d = app.submitted_at || app.submission_date;
        return d ? new Date(d).toLocaleDateString() : '—';
    };

    const handleDelete = async (applicationId) => {
        if (!confirm("Are you sure you want to delete this application?")) return;
        try {
        const res = await fetch(`${base}Application/${applicationId}/`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete application");
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        } catch (err) {
        alert(err.message || "Error deleting application");
        }
    };

    // 5) Safe early returns AFTER all hooks have run
    if (loading) return <div>Loading applications...</div>;
    if (errorMsg) return <div className="text-red-500">Error: {errorMsg}</div>;

    return (
        <div className="w-6xl mx-auto mt-6 mb-10">
        <Table>
            <TableCaption>A list of all applications</TableCaption>
            <TableHeader>
            <TableRow>
                <TableHead>Form ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Action</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {applications.map((application) => (
                <TableRow key={application.id}>
                <TableCell>{application.id}</TableCell>
                <TableCell>{getApplicantName(application)}</TableCell>
                <TableCell className="capitalize">{application.status ?? '—'}</TableCell>
                <TableCell>{getSubmittedDate(application)}</TableCell>
                <TableCell>
                    <Link
                    href={`/applicationDashboard/${application.id}`}
                    className="text-blue-500 hover:underline"
                    >
                    View Details
                    </Link>
                </TableCell>
                <TableCell>
                    <div className="grid grid-cols-2 gap-2 h-8 w-32">
                    <Link href={`/applicationDashboard/${application.id}/edit`}>
                        <Button asChild variant="outline">
                        <span>Edit</span>
                        </Button>
                    </Link>
                    <Button onClick={() => handleDelete(application.id)}>Delete</Button>
                    </div>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
    );
}
