import React from "react";
import Image from "next/image";
import LOGO from "@/app/Assets/EduScope.png";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">  {/* Full height container */}

      {/* Main content area */}
      <main className="grow flex flex-col items-center py-2">
        <div className="bg-white shadow-md rounded-md p-3 w-10/12 grid grid-cols-2 mt-5 mb-10">
          <h3 className="text-2xl font-bold mb-4 text-orange-500">Forms</h3>
          <Image
            src={LOGO}
            alt="EduScope Logo"
            className="w-48 h-10 justify-self-end"
          />
        </div>

        <div className="grid grid-cols-2 gap-10">
          <Button variant="outline" className="w-88 h-16 border-2 border-orange-400 bg-orange-100 hover:bg-orange-200">
            Submit Applicant Details
          </Button>

          <Button variant="outline" className="w-88 h-16 border-2 border-orange-400 bg-orange-100 hover:bg-orange-200">
            Submit Application Details
          </Button>
        </div>
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Home;
