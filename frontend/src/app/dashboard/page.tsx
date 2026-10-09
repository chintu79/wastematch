"use client";

import { useState } from "react";
import BuyerDashboard from "@/components/dashboard/BuyerDashboard";
import ProducerDashboard from "@/components/dashboard/ProducerDashboard";

// In a real application, this would come from an AuthProvider context
type OrgType = "BUYER" | "PRODUCER";

export default function DashboardHome() {
  // Mocking the authenticated user's role.
  // We use a state to allow switching for dev/demo purposes.
  const [role, setRole] = useState<OrgType>("BUYER");

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full">
      {/* Dev Mode Switcher - Hidden in production */}
      <div className="bg-gray-800 text-gray-300 text-xs py-1 px-4 flex justify-between items-center">
        <span>Dev Mode: Simulated Auth Routing</span>
        <div className="flex space-x-4">
          <button 
            onClick={() => setRole("BUYER")}
            className={`hover:text-white ${role === "BUYER" ? "text-blue-400 font-bold" : ""}`}
          >
            Act as Buyer
          </button>
          <button 
            onClick={() => setRole("PRODUCER")}
            className={`hover:text-white ${role === "PRODUCER" ? "text-green-400 font-bold" : ""}`}
          >
            Act as Producer
          </button>
        </div>
      </div>

      {/* Render the appropriate workspace */}
      {role === "BUYER" ? <BuyerDashboard /> : <ProducerDashboard />}
    </div>
  );
}
