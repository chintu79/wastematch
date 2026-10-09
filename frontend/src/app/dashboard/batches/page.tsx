"use client";

import { Layers, Search, Filter, Plus, FileText, CheckCircle2 } from "lucide-react";

export default function BatchesPage() {
  const batches = [
    { id: "BCH-1092", material: "Copper Slag", facility: "Bhosari MIDC", volume: "120 Tons", date: "Oct 5, 2026", status: "In Stock" },
    { id: "BCH-1091", material: "PET Bottles", facility: "Chakan Plant", volume: "45 Tons", date: "Oct 2, 2026", status: "Reserved" },
    { id: "BCH-1089", material: "Aluminum Scrap", facility: "Bhosari MIDC", volume: "80 Tons", date: "Sep 28, 2026", status: "Sold" },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-7xl mx-auto h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><Layers className="w-6 h-6 mr-2 text-emerald-600" /> Material Batches</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your physical inventory and production batches.</p>
        </div>
        <button className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium">
          <Plus className="w-4 h-4" /> <span>Add Batch</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search batches..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <button className="flex items-center text-sm text-gray-600 font-medium hover:text-gray-900 border border-gray-300 px-3 py-2 rounded-md bg-white">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Batch ID</th>
              <th className="px-6 py-4 font-semibold">Material</th>
              <th className="px-6 py-4 font-semibold">Facility</th>
              <th className="px-6 py-4 font-semibold">Volume</th>
              <th className="px-6 py-4 font-semibold">Date Logged</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-emerald-700">{batch.id}</td>
                <td className="px-6 py-4 font-medium">{batch.material}</td>
                <td className="px-6 py-4 text-gray-600">{batch.facility}</td>
                <td className="px-6 py-4 font-semibold">{batch.volume}</td>
                <td className="px-6 py-4 text-gray-500">{batch.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    batch.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
                    batch.status === 'Reserved' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {batch.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1.5 rounded bg-blue-50">View Manifest</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
