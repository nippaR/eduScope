'use client';
import {useEffect, useState} from "react";
import { FileText, UserCheck, UserRoundX, FileClock } from "lucide-react";

export default function ApplicationDashboard() {

    {/*fetching Application Data */}
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        async function fetchApplications() {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "Application/", {
                cache: "no-store",
            });
            const data = await res.json();
            setApplications(data);
        }
        fetchApplications();
    }, []);

    {/* Get Total no. of application count */}
    const totalApplications = String(applications?.length ?? 0).padStart(2, '0');

    {/* Get Total no. of Processing Applications */}
    const totalProcessingApplications = String(applications?.filter(app => app.status === 'pending')?.length ?? 0).padStart(2, '0');

    {/* Get Total no. of Approved Applications */}
    const totalApprovedApplications = String(applications?.filter(app => app.status === 'approved')?.length ?? 0).padStart(2, '0');

    {/* Get Total no. of Rejected Applications */}
    const totalRejectedApplications = String(applications?.filter(app => app.status === 'rejected')?.length ?? 0).padStart(2, '0');

    return (

        <div>
            {/* Main content area */}
            <main className="grow flex flex-col items-center py-6">

            <div className="grid grid-cols-4 gap-6 mt-6 w-6xl h-auto">

                {/*Total Applications Count */}

                <div className="bg-white shadow-md rounded-md p-4 border border-orange-300
                hover:scale-105 transition-transform w-full flex items-center gap-4">

                    {/* Icon */}
                    <span className="text-4xl text-orange-500 flex items-center justify-center">
                        <FileText />
                    </span>

                    {/* Text */}
                    <div className="flex flex-col">
                        <h5 className="text-lg font-semibold text-gray-700">Total Applications</h5>
                        <p className="text-3xl font-bold text-orange-500 text-center">{totalApplications}</p>
                    </div>

                </div>

                {/*Total Processing Applications */}

                <div className="bg-white shadow-md rounded-md p-4 border border-orange-300
                hover:scale-105 transition-transform w-full flex items-center gap-4">

                    {/* Icon */}
                    <span className="text-4xl text-orange-500 flex items-center justify-center">
                        <FileClock />
                    </span>

                    {/* Text */}
                    <div className="flex flex-col">
                        <h5 className="font-semibold text-gray-700">Processing Applications</h5>
                        <p className="text-3xl font-bold text-orange-500 text-center">{totalProcessingApplications}</p>
                    </div>

                </div>

                {/*Total Approved Applications */}

                <div className="bg-white shadow-md rounded-md p-4 border border-orange-300
                hover:scale-105 transition-transform w-full flex items-center gap-4">

                    {/* Icon */}

                    <span className="text-4xl text-orange-500 flex items-center justify-center">
                        <UserCheck />
                    </span>

                    {/* Text */}

                    <div className="flex flex-col">
                        <h5 className="font-semibold text-gray-700">Approved Applications</h5>
                        <p className="text-3xl font-bold text-orange-500 text-center">{totalApprovedApplications}</p>
                    </div>

                </div>

                {/* Total Rejected Applications */}

                <div className="bg-white shadow-md rounded-md p-4 border border-orange-300
                hover:scale-105 transition-transform w-full flex items-center gap-4">

                    {/* Icon */}
                    <span className="text-4xl text-orange-500 flex items-center justify-center">
                        <UserRoundX/>
                    </span>

                    {/* Text */}
                    <div className="flex flex-col">
                        <h5 className="font-semibold text-gray-700">Rejected Applications</h5>
                        <p className="text-3xl font-bold text-orange-500 text-center">{totalRejectedApplications}</p>
                    </div>
                </div>


            </div>

            </main>
        </div>
    );
}
