"use client";

import { useState } from "react";
import { Building, MapPin, ShieldCheck, Save, CheckCircle2, FileText, AlertTriangle, Briefcase, Factory } from "lucide-react";

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState("general");
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
    <div className="flex-1 p-4 md:p-8 bg-gray-50 text-gray-900 max-w-5xl mx-auto min-h-screen relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Facility profile successfully updated!</span>
      </div>

      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold flex items-center"><Building className="w-6 h-6 mr-2 text-indigo-600" /> Organization & Facilities</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your corporate entity details, legal compliance, and physical operational branches.</p>
      </div>

      {/* TABS */}
      <div className="flex space-x-6 mb-6 px-2">
        <button onClick={() => setActiveTab("general")} className={`pb-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>General Info</button>
        <button onClick={() => setActiveTab("legal")} className={`pb-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'legal' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Legal & Compliance</button>
        <button onClick={() => setActiveTab("facilities")} className={`pb-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'facilities' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Facilities (Locations)</button>
      </div>

      {activeTab === "general" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Briefcase className="w-5 h-5 text-gray-400" /> Company Profile</h2>
            <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 mr-1" /> Verified Account
            </span>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input type="text" defaultValue="EcoRecycle Industries Pvt Ltd" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-600" readOnly />
                <p className="text-[10px] text-gray-500 mt-1">To change legal entity name, please contact support.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry Classification (NIC Code)</label>
                <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                  <option>38300 - Materials Recovery</option>
                  <option>2410 - Manufacture of Basic Iron/Steel</option>
                  <option>2011 - Manufacture of Basic Chemicals</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Person</label>
                <input type="text" defaultValue="Rahul Sharma" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" defaultValue="compliance@ecorecycle.in" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Office Address</label>
                <textarea defaultValue="101, Business Towers, Viman Nagar, Pune 411014" rows={2} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center bg-indigo-600 text-white px-6 py-2.5 rounded-md font-medium transition-all ${isSaving ? 'opacity-70 cursor-wait' : 'hover:bg-indigo-500 hover:shadow-lg active:scale-95'}`}
              >
                <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "legal" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" /> Legal & Taxation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Identity Number (CIN)</label>
              <input type="text" defaultValue="U74999PN2015PTC155555" className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-600" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input type="text" defaultValue="27AABCU9603R1ZN" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input type="text" defaultValue="AABCU9603R" className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start">
             <ShieldCheck className="w-6 h-6 text-blue-600 mt-0.5" />
             <div>
               <h4 className="font-bold text-blue-900 text-sm">Regulatory Document Uploads</h4>
               <p className="text-xs text-blue-800 mt-1 mb-3">To unlock full trading limits on the marketplace, upload your latest MPCB annual returns and GST certificates.</p>
               <button className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">Upload Documents</button>
             </div>
          </div>
        </div>
      )}

      {activeTab === "facilities" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Registered Operational Branches</h2>
            <button className="text-sm font-bold bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">Add New Facility</button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Facility 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-bl-lg">PRIMARY PLANT</div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Factory className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Pune Chakan Processing Plant</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" /> Plot 45, Phase 2, Chakan Industrial Area, Pune 410501
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div>
                       <p className="text-[10px] uppercase text-gray-500 font-bold">Capacity</p>
                       <p className="text-sm font-semibold text-gray-900">4,500 Tons/Month</p>
                    </div>
                    <div>
                       <p className="text-[10px] uppercase text-gray-500 font-bold">MPCB Status</p>
                       <p className="text-sm font-semibold text-emerald-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Valid till Dec 2028</p>
                    </div>
                  </div>
                </div>
                <button className="text-indigo-600 text-sm font-bold hover:underline">Edit Details</button>
              </div>
            </div>

            {/* Facility 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <Factory className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Bhosari Storage Hub</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" /> Sector 7, Bhosari MIDC, Pune 411026
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div>
                       <p className="text-[10px] uppercase text-gray-500 font-bold">Capacity</p>
                       <p className="text-sm font-semibold text-gray-900">1,200 Tons/Month (Storage Only)</p>
                    </div>
                    <div>
                       <p className="text-[10px] uppercase text-gray-500 font-bold">MPCB Status</p>
                       <p className="text-sm font-semibold text-rose-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Renewal Pending</p>
                    </div>
                  </div>
                </div>
                <button className="text-indigo-600 text-sm font-bold hover:underline">Edit Details</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
