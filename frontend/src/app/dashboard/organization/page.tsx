"use client";

import { Building, MapPin, ShieldCheck, Save } from "lucide-react";

export default function OrganizationPage() {
  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-4xl mx-auto h-screen">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold flex items-center"><Building className="w-6 h-6 mr-2 text-indigo-600" /> Facility Profile</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your organization details and operational locations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
          <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 mr-1" /> MPCB Verified
          </span>
        </div>
        
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input type="text" defaultValue="EcoRecycle Industries Pvt Ltd" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number (CIN)</label>
              <input type="text" defaultValue="U74999PN2015PTC155555" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Person</label>
              <input type="text" defaultValue="Rahul Sharma" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" defaultValue="compliance@ecorecycle.in" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="button" className="flex items-center bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 font-medium">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Registered Facilities</h2>
        <div className="border border-gray-200 rounded-lg p-4 flex items-start">
          <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900">Pune Chakan Plant (Primary)</h3>
            <p className="text-sm text-gray-600 mt-1">Plot 45, Phase 2, Chakan Industrial Area, Pune, Maharashtra 410501</p>
            <p className="text-xs text-emerald-600 font-semibold mt-2">MPCB Consent: Valid till Dec 2028</p>
          </div>
        </div>
      </div>
    </div>
  );
}
