"use client";

import { useState } from "react";
import { Building, MapPin, ShieldCheck, Save, CheckCircle2 } from "lucide-react";

export default function OrganizationPage() {
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-4xl mx-auto min-h-screen relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Facility profile successfully updated!</span>
      </div>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold flex items-center"><Building className="w-6 h-6 mr-2 text-indigo-600" /> Facility Profile</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your organization details and operational locations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-shadow">
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
              <input type="text" defaultValue="Rahul Sharma" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" defaultValue="compliance@ecorecycle.in" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center bg-indigo-600 text-white px-6 py-2.5 rounded-md font-medium transition-all ${isSaving ? 'opacity-70 cursor-wait' : 'hover:bg-indigo-500 hover:shadow-lg active:scale-95'}`}
            >
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Registered Facilities</h2>
        <div className="border border-gray-200 rounded-lg p-4 flex items-start group-hover:border-indigo-200 transition-colors">
          <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0 group-hover:animate-bounce" />
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
