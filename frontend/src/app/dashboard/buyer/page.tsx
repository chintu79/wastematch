"use client";

import { useState } from "react";
import CompatibilityScoreCard from "@/components/dashboard/CompatibilityScoreCard";

import { Search, Bookmark, Target, TrendingUp } from "lucide-react";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("matches");

  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
          <p className="text-gray-600">Source raw materials and track supplier matches</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Target className="w-5 h-5" />
          <span>New Specification</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">New Matches</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Specs</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Pending Samples</h3>
          <p className="text-3xl font-bold mt-2">2</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Sourced (YTD)</h3>
          <p className="text-3xl font-bold mt-2">8,200t</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['matches', 'specifications', 'samples'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Top Recommended Matches</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Filter matches..." className="pl-9 pr-4 py-2 border rounded-md text-sm" />
                </div>
              </div>
              
              {/* Match Cards */}
              <CompatibilityScoreCard />
            </div>
          )}
          {activeTab === 'specifications' && (
            <div className="text-center py-12 text-gray-500">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Manage your raw material buying specifications.</p>
            </div>
          )}
          {activeTab === 'samples' && (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Track the status of your requested material samples.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
