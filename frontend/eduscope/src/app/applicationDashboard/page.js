'use client';
import React from "react";
import Image from "next/image";
import LOGO from "@/app/Assets/EduScope.png";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {SidebarProvider,} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/appsidebar";

export default function ApplicationDashboard() {
    return (
        <div>
        <SidebarProvider>

        {/* Sidebar */}

        <AppSidebar />

            {/* Main content area */}
            <main className="grow flex flex-col items-center py-6">

            {/* Set this div section to be sticky */}
            
            <div className="bg-white shadow-md rounded-md p-3 w-6xl grid grid-cols-2 gap-2 sticky top-0 z-10">

                <h3 className="text-2xl font-bold text-orange-500">Application Dashboard</h3>
                <Image src={LOGO} alt="EduScope Logo" className="w-48 h-10 justify-self-end" />

            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Button variant="outline" className="h-16 border-2 border-orange-400 bg-orange-100 hover:bg-orange-200">
                Submit Applicant Details
                </Button>
                <Button variant="outline" className="h-16 border-2 border-orange-400 bg-orange-100 hover:bg-orange-200">
                Submit Application Details
                </Button>
            </div>
            </main>
    
        </SidebarProvider>
            <Footer />
        </div>
    );
}
