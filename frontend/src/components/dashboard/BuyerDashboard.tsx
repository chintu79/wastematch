import { useState } from "react";
import Link from "next/link";
import { Search, Bookmark, Target, TrendingUp, AlertCircle, MessageSquare } from "lucide-react";
import CompatibilityScoreCard from "@/components/dashboard/CompatibilityScoreCard";

export default function BuyerDashboard() {
  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-7xl mx-auto">
      {/* Welcome Bar & Primary Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, EcoRecycle Inc.</h1>
          <p className="text-gray-600">Here is your active material sourcing activity.</p>
        </div>
        <Link href="/dashboard/specifications/new" className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 shadow-sm font-medium">
          <Target className="w-5 h-5" />
          <span>Create Specification</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Action Required / Active Inquiries */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2" /> 
              Action Required
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
              <div className="p-4 hover:bg-amber-50 flex items-start justify-between border-b border-gray-100 last:border-0 cursor-pointer">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">Sample Shipped</span>
                    <h3 className="font-semibold text-gray-900">Copper Slag - Industrial Metals</h3>
                  </div>
                  <p className="text-sm text-gray-600">Sample #SR-992 is arriving today. Please confirm receipt and enter lab results.</p>
                </div>
                <button className="text-blue-600 font-medium text-sm whitespace-nowrap bg-blue-50 px-3 py-1 rounded">Update Status</button>
              </div>
            </div>
          </section>

          {/* New Recommended Matches */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-gray-800">Top Recommended Matches</h2>
              <Link href="/dashboard/matches" className="text-sm text-blue-600 font-medium hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              <CompatibilityScoreCard />
            </div>
          </section>
          
        </div>

        {/* Right Column (Secondary / Quick Access) */}
        <div className="space-y-8">
          
          {/* Active Specifications */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-gray-800">My Specifications</h2>
              <Link href="/dashboard/specifications" className="text-sm text-blue-600 font-medium hover:underline">Manage</Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold text-gray-900 mb-1">High-Purity Copper Slag</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Need: 200T/mo</span>
                  <span className="text-green-600 font-medium">3 Matches</span>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-semibold text-gray-900 mb-1">Baled PET Bottles</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Need: 50T/mo</span>
                  <span className="text-gray-400">0 Matches</span>
                </div>
              </div>
            </div>
          </section>

          {/* Saved Materials */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Bookmark className="w-5 h-5 text-gray-400 mr-2" /> 
              Saved Materials
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center text-gray-500">
              <p className="text-sm">You haven&apos;t saved any materials yet.</p>
              <Link href="/dashboard/matches" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">Browse materials</Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
