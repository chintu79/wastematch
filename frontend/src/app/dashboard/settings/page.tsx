"use client";

import { Settings, Bell, Lock, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-4xl mx-auto h-screen">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold flex items-center"><Settings className="w-6 h-6 mr-2 text-slate-700" /> Account Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your personal preferences, notifications, and security.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-1">
          <button className="w-full flex items-center text-sm font-semibold text-slate-900 bg-slate-200/50 px-3 py-2.5 rounded-md">
            <User className="w-4 h-4 mr-2" /> Profile
          </button>
          <button className="w-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2.5 rounded-md">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </button>
          <button className="w-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2.5 rounded-md">
            <Lock className="w-4 h-4 mr-2" /> Security
          </button>
        </div>
        
        <div className="flex-1 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Settings</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 rounded-md p-2 focus:ring-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" defaultValue="john.doe@example.com" className="w-full border border-gray-300 rounded-md p-2 focus:ring-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input type="text" defaultValue="Procurement Manager" className="w-full border border-gray-300 rounded-md p-2 focus:ring-slate-500" />
            </div>
            <div className="pt-4">
              <button type="button" className="bg-slate-800 text-white px-5 py-2 rounded-md hover:bg-slate-900 font-medium">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
