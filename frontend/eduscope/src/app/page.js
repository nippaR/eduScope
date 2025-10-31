'use client';

import {useState} from "react";
import Image from "next/image";
import LOGO from "@/app/Assets/EduScope.png";
import Footer from "@/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/ui/appsidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ApplicantForm from "@/components/ApplicantForm";
import ApplicationForm from "@/components/ApplicationForm";



export default function Home() {

  const [showForm, setShowForm] = useState(false);

  return (
    <div>
    <SidebarProvider>

      {/* Sidebar */}

      <AppSidebar />

        {/* Main content area */}
        <main className="grow flex flex-col items-center py-6">

         {/* Set this div section to be sticky */}
            
          <div className="bg-white shadow-md rounded-md p-3 w-6xl grid grid-cols-2 gap-2 sticky top-0 z-10">

            <h3 className="text-2xl font-bold text-orange-500">Forms</h3>
            <Image src={LOGO} alt="EduScope Logo" className="w-48 h-10 justify-self-end" />

          </div>

          <div className="mt-8">
            <Tabs defaultValue="applicant" className="bg-white p-4 rounded-md shadow-md">
              <TabsList>
                <TabsTrigger value="applicant">Applicant Details Form</TabsTrigger>
                <TabsTrigger value="application">Application Details Form</TabsTrigger>
              </TabsList>

              <TabsContent value="applicant">
                <ApplicantForm />
              </TabsContent>

              <TabsContent value="application">
                <ApplicationForm />
              </TabsContent>
            </Tabs>
          </div>

        </main>
  
    </SidebarProvider>
        <Footer />
    </div>
  );
}
