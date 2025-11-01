'use client';
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import LOGO from "@/app/Assets/EduScope.png";
import Footer from "@/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/appsidebar";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table";

    export default function ApplicantDashboard() {
    const [applicants, setApplicants] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        async function loadData() {
        try {
            setLoading(true);
            setErrorMsg("");

            const base = process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
            ? process.env.NEXT_PUBLIC_API_URL
            : `${process.env.NEXT_PUBLIC_API_URL}/`;

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

            setApplicants(applicantsData || []);
            setApplications(applicationsData || []);
        } catch (err) {
            setErrorMsg(err.message || "Something went wrong loading data");
        } finally {
            setLoading(false);
        }
        }
        loadData();
    }, []);

    // Create a Map: applicantId → their applications
    const appsByApplicantId = useMemo(() => {
        const map = new Map();
        for (const app of applications) {
        const key = app.applicant_id || app.applicantId || app.applicant || app.ApplicantId;
        if (!key) continue;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(app);
        }

        // Sort each applicant’s applications newest first
        for (const [k, arr] of map) {
        arr.sort((a, b) => {
            const da = new Date(a.updated_at || a.created_at || 0).getTime();
            const db = new Date(b.updated_at || b.created_at || 0).getTime();
            return db - da;
        });
        }
        return map;
    }, [applications]);

    if (loading) return <div className="p-6 text-gray-600">Loading applicants & applications…</div>;
    if (errorMsg) return <div className="p-6 text-red-600">Error: {errorMsg}</div>;

    return (
        <div>
        <SidebarProvider>
            <AppSidebar />

            <main className="grow flex flex-col items-center py-6">
            <div className="bg-white shadow-md rounded-md p-3 w-6xl grid grid-cols-2 gap-2 sticky top-0 z-10">
                <h3 className="text-2xl font-bold text-orange-500">Applicant Dashboard</h3>
                <Image src={LOGO} alt="EduScope Logo" className="w-48 h-10 justify-self-end" />
            </div>

            <div className="mt-6 w-6xl bg-white shadow-md rounded-md p-6 overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">Applicant Details</h2>

                <Table>
                <TableCaption>List of applicants with their latest status</TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Latest Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants.length > 0 ? (
                    applicants.map((a) => {
                        const apps = appsByApplicantId.get(a.id) || [];
                        const latestStatus = apps[0]?.status ?? "N/A";

                        return (
                        <TableRow key={a.id}>
                            <TableCell>{`${a.first_name ?? ""} ${a.last_name ?? ""}`}</TableCell>
                            <TableCell>{a.email ?? "—"}</TableCell>
                            <TableCell>{a.phone ?? "—"}</TableCell>
                            <TableCell>{a.address ?? "—"}</TableCell>
                            <TableCell>{a.dob ?? "—"}</TableCell>
                            <TableCell className="capitalize">{latestStatus}</TableCell>
                        </TableRow>
                        );
                    })
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                        No applicants found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </main>
        </SidebarProvider>
        <Footer />
        </div>
    );
}
