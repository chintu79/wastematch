import { useState } from "react";
import Link from "next/link";
import { PlusCircle, List, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function ProducerDashboard() {
  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-7xl mx-auto">
      {/* Welcome Bar & Primary Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Industrial Metals Corp.</h1>
          <p className="text-gray-600">Here is your active material listing activity.</p>
        </div>
        <Link href="/dashboard/listings/new" className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2.5 rounded-md hover:bg-green-700 shadow-sm font-medium">
          <PlusCircle className="w-5 h-5" />
          <span>New Material Listing</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Actions / Inquiries */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-amber-500 mr-2" /> 
              Pending Actions
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden divide-y divide-gray-100">
              <div className="p-4 hover:bg-amber-50 flex items-start justify-between cursor-pointer">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">New Message</span>
                    <h3 className="font-semibold text-gray-900">Inquiry on Copper Slag Batch #442</h3>
                  </div>
                  <p className="text-sm text-gray-600">EcoRecycle Inc: &quot;Can you provide the latest moisture test results?&quot;</p>
                </div>
                <Link href="/dashboard/inbox" className="text-blue-600 font-medium text-sm whitespace-nowrap bg-blue-50 px-3 py-1 rounded hover:bg-blue-100">Reply</Link>
              </div>
              <div className="p-4 hover:bg-amber-50 flex items-start justify-between cursor-pointer">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">Missing Evidence</span>
                    <h3 className="font-semibold text-gray-900">Steel Turnings - Scrap</h3>
                  </div>
                  <p className="text-sm text-gray-600">Safety Data Sheet (SDS) is missing or expired. Buyers cannot complete checkout.</p>
                </div>
                <button className="text-gray-700 font-medium text-sm whitespace-nowrap bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Upload SDS</button>
              </div>
            </div>
          </section>

          {/* My Listings */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-gray-800">Active Listings</h2>
              <Link href="/dashboard/listings" className="text-sm text-green-600 font-medium hover:underline">View all</Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <div className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <List className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Copper Slag - Granulated</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                      <span>Batch #442</span>
                      <span>•</span>
                      <span className="flex items-center text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Compliant</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">120 Tons</div>
                  <div className="text-sm text-blue-600 font-medium mt-1">2 Active Inquiries</div>
                </div>
              </div>
              
              <div className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <List className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Steel Turnings</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                      <span>Batch #445</span>
                      <span>•</span>
                      <span className="flex items-center text-red-500"><AlertTriangle className="w-3 h-3 mr-1" /> Action Required</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">45 Tons</div>
                  <div className="text-sm text-gray-400 mt-1">0 Inquiries</div>
                </div>
              </div>
            </div>
          </section>
          
        </div>

        {/* Right Column (Secondary / Quick Access) */}
        <div className="space-y-8">
          
          {/* Quick Stats */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Summary Stats</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Listings</span>
                <span className="font-bold text-gray-900">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Volume</span>
                <span className="font-bold text-gray-900">165 Tons</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Matches</span>
                <span className="font-bold text-gray-900">5</span>
              </div>
            </div>
          </section>

          {/* Compliance Shortcuts */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 text-gray-400 mr-2" /> 
              Compliance Documents
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded mb-1">Annual Returns (Form 4)</button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded mb-1">Manifest Generation</button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Lab Analysis Directory</button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
