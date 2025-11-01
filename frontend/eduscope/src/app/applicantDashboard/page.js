'use client';
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import LOGO from "@/app/Assets/EduScope.png";
import Footer from "@/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/appsidebar";

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

    // Memoized map of applicant ID to their applications
    const appsByApplicantId = useMemo(() => {
        const map = new Map();
        for (const app of applications) {

        // Adjust the key name below to match your API shape:
        const key = app.applicant_id || app.applicantId || app.applicant || app.ApplicantId;
        if (!key) continue;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(app);
        }
        
        // Optional: sort each applicant's apps by created_at/updated_at if available
        //first come latest
        for (const [k, arr] of map) {
        arr.sort((a, b) => {
            const da = new Date(a.updated_at || a.created_at || 0).getTime();
            const db = new Date(b.updated_at || b.created_at || 0).getTime();
            return db - da;
        });
        }
        return map;
    }, [applications]);

    if (loading) {
        return (
        <div className="p-6 text-gray-600">Loading applicants & applications…</div>
        );
    }

    if (errorMsg) {
        return (
        <div className="p-6 text-red-600">Error: {errorMsg}</div>
        );
    }

    return (
        <div>
        <SidebarProvider>
            <AppSidebar />
            <main className="grow flex flex-col items-center py-6">
            <div className="bg-white shadow-md rounded-md p-3 w-6xl grid grid-cols-2 gap-2 sticky top-0 z-10">
                <h3 className="text-2xl font-bold text-orange-500">Applicant Dashboard</h3>
                <Image src={LOGO} alt="EduScope Logo" className="w-48 h-10 justify-self-end" />
            </div>

            <div className="mt-6 w-6xl bg-white shadow-md rounded-md p-6">
                <h2 className="text-xl font-semibold mb-4">Applicant Details</h2>

                {applicants.map((a) => {
                const apps = appsByApplicantId.get(a.id) || [];
                // Option A: show latest status (most recent app first due to sort above)
                const latestStatus = apps[0]?.status ?? "N/A";

                return (
                    <div key={a.id} className="border-b border-gray-300 pb-4 mb-4">
                    <p><strong>Name:</strong> {a.first_name} {a.last_name}</p>
                    <p><strong>Email:</strong> {a.email}</p>
                    <p><strong>Phone:</strong> {a.phone}</p>
                    <p><strong>Address:</strong> {a.address}</p>
                    <p><strong>Date of Birth:</strong> {a.dob}</p>
                    <p><strong>Guardian Name:</strong> {a.guardian_name}</p>

                    {/* Option A: single (latest) status */}
                    <p className="mt-2"><strong>Latest Application Status:</strong> {latestStatus}</p>
                    
                    </div>
                );
                })}
            </div>
            </main>
        </SidebarProvider>
        <Footer />
        </div>
    );
}
