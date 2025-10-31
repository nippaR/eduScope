'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import LOGO from "@/app/Assets/EduScope.png";
import Footer from "@/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/appsidebar";

export default function ApplicantDashboard() {
    const [applicants, setApplicants] = useState([]);

    useEffect(() => {
        async function loadApplicants() {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "Applicant/", {
            cache: "no-store",
        });
        const data = await res.json();
        setApplicants(data);
        }
        loadApplicants();
    }, []);

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
                {applicants.map((a) => (
                <div key={a.id} className="border-b border-gray-300 pb-4 mb-4">
                    <p><strong>Name:</strong> {a.first_name} {a.last_name}</p>
                    <p><strong>Email:</strong> {a.email}</p>
                    <p><strong>Phone:</strong> {a.phone}</p>
                    <p><strong>Address:</strong> {a.address}</p>
                    <p><strong>Date of Birth:</strong> {a.dob}</p>
                    <p><strong>Guardian Name:</strong> {a.guardian_name}</p>
                </div>
                ))}
            </div>
            </main>
        </SidebarProvider>
        <Footer />
        </div>
    );
}
