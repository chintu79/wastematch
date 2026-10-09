"use client";

import { useState } from "react";
import { PlusCircle, List, FileText, Activity } from "lucide-react";

export default function ProducerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Producer Dashboard</h1>
          <p className="text-gray-600">Manage your waste inventory and compliance</p>
        </div>
        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          <PlusCircle className="w-5 h-5" />
          <span>New Material Listing</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Listings</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Volume (Tons)</h3>
          <p className="text-3xl font-bold mt-2">1,450</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Pending Inquiries</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Compliance Alerts</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">1</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['overview', 'inventory', 'compliance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <p className="text-sm font-medium text-blue-800">New Inquiry</p>
                <p className="text-sm text-blue-600">EcoRecycle Inc requested a sample for "Clean PET Bottles".</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                <p className="text-sm font-medium text-yellow-800">Action Required</p>
                <p className="text-sm text-yellow-600">Update safety data sheet for Copper Slag batch #442.</p>
              </div>
            </div>
          )}
          {activeTab === 'inventory' && (
            <div className="text-center py-12 text-gray-500">
              <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Inventory management table goes here.</p>
            </div>
          )}
          {activeTab === 'compliance' && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Regulatory compliance documents and tracking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
