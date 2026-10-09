"use client";

import { useState } from "react";
import { Settings, Bell, Lock, User, CheckCircle2, Mail, Smartphone, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
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
    <div className="flex-1 p-4 md:p-8 bg-gray-50 text-gray-900 max-w-5xl mx-auto min-h-screen relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Settings updated successfully!</span>
      </div>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold flex items-center"><Settings className="w-6 h-6 mr-2 text-slate-700 hover:rotate-90 transition-transform duration-500" /> Account Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your personal preferences, notifications, and security.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center text-sm font-semibold px-3 py-2.5 rounded-md transition-colors ${activeTab === "profile" ? "text-slate-900 bg-slate-200/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
            <User className="w-4 h-4 mr-2" /> Profile
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center text-sm font-semibold px-3 py-2.5 rounded-md transition-colors ${activeTab === "notifications" ? "text-slate-900 bg-slate-200/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center text-sm font-semibold px-3 py-2.5 rounded-md transition-colors ${activeTab === "security" ? "text-slate-900 bg-slate-200/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
            <Lock className="w-4 h-4 mr-2" /> Security
          </button>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Profile Details</h2>
              <form className="space-y-5 max-w-md">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-emerald-200">
                    JD
                  </div>
                  <div>
                    <button type="button" className="text-sm font-medium text-emerald-600 hover:underline">Change Avatar</button>
                    <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" defaultValue="john.doe@example.com" className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input type="text" defaultValue="Procurement Manager" className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" />
                </div>
                <div className="pt-4">
                  <button type="button" onClick={handleSave} disabled={isSaving} className={`bg-slate-800 text-white px-6 py-2.5 rounded-md font-medium transition-all ${isSaving ? 'opacity-70 cursor-wait' : 'hover:bg-slate-700 hover:shadow-lg active:scale-95'}`}>
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Notification Preferences</h2>
              <div className="space-y-6">
                
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Email Alerts</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">Receive email notifications when new candidate matches are found or specifications are updated.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Push Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">Get real-time push alerts on your desktop for immediate regulatory compliance warnings.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="pt-6 border-t">
                  <button type="button" onClick={handleSave} disabled={isSaving} className={`bg-slate-800 text-white px-6 py-2.5 rounded-md font-medium transition-all ${isSaving ? 'opacity-70 cursor-wait' : 'hover:bg-slate-700 hover:shadow-lg active:scale-95'}`}>
                    {isSaving ? 'Saving...' : 'Update Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Security & Authentication</h2>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-emerald-700 mt-1 mb-3">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                  <button className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors">Enable 2FA</button>
                </div>
              </div>

              <form className="space-y-4 max-w-md">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Key className="w-4 h-4" /> Change Password</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" />
                </div>
                <div className="pt-2">
                  <button type="button" onClick={handleSave} disabled={isSaving} className={`bg-slate-800 text-white px-6 py-2.5 rounded-md font-medium transition-all ${isSaving ? 'opacity-70 cursor-wait' : 'hover:bg-slate-700 hover:shadow-lg active:scale-95'}`}>
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
