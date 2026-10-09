"use client";

import { useState } from "react";
import { Settings, Bell, Lock, User, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 600);
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-4xl mx-auto min-h-screen relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Profile preferences updated!</span>
      </div>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold flex items-center"><Settings className="w-6 h-6 mr-2 text-slate-700 hover:rotate-90 transition-transform duration-500" /> Account Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your personal preferences, notifications, and security.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-1">
          <button className="w-full flex items-center text-sm font-semibold text-slate-900 bg-slate-200/50 px-3 py-2.5 rounded-md transition-colors">
            <User className="w-4 h-4 mr-2" /> Profile
          </button>
          <button className="w-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2.5 rounded-md transition-colors">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </button>
          <button className="w-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2.5 rounded-md transition-colors">
            <Lock className="w-4 h-4 mr-2" /> Security
          </button>
        </div>
        
        <div className="flex-1 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Settings</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" defaultValue="john.doe@example.com" className="w-full border border-gray-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input type="text" defaultValue="Procurement Manager" className="w-full border border-gray-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 transition-shadow" />
            </div>
            <div className="pt-4">
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSaving}
                className={`bg-slate-800 text-white px-6 py-2.5 rounded-md font-medium transition-all ${isSaving ? 'opacity-70 cursor-wait' : 'hover:bg-slate-700 hover:shadow-lg active:scale-95'}`}
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
