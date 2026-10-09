"use client";

import { useState } from "react";
import { Sparkles, GitCompare, ChevronRight, CheckCircle2 } from "lucide-react";

export default function MatchesPage() {
  const [showToast, setShowToast] = useState(false);

  const handleContact = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const matches = [
    { id: 1, material: "High-Purity Copper Slag", buyer: "EcoRecycle Inc", score: 98, distance: "12 km", status: "Perfect Match" },
    { id: 2, material: "PET Flakes - Clear", buyer: "Polymer Works", score: 85, distance: "45 km", status: "Good Fit" },
    { id: 3, material: "Aluminum Scrap", buyer: "MetalCorp Ltd", score: 62, distance: "120 km", status: "Marginal Fit" },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-7xl mx-auto min-h-screen relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Connection request sent to candidate!</span>
      </div>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold flex items-center"><Sparkles className="w-6 h-6 mr-2 text-purple-600" /> Candidate Buyers & Matches</h1>
        <p className="text-gray-600 text-sm mt-1">Review algorithmically scored compatibility matches for your active materials.</p>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:border-purple-300 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-purple-100 bg-purple-50 text-purple-700 font-extrabold text-lg group-hover:scale-110 transition-transform duration-500">
                {match.score}%
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{match.material}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                    match.score >= 90 ? 'bg-emerald-100 text-emerald-800' :
                    match.score >= 80 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Candidate: <span className="font-semibold text-gray-800">{match.buyer}</span> • Logistics: {match.distance} away</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex items-center text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors active:scale-95">
                <GitCompare className="w-4 h-4 mr-2" /> View Specs
              </button>
              <button onClick={handleContact} className="flex items-center text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 hover:shadow-lg px-4 py-2 rounded-lg transition-all active:scale-95">
                Initiate Contact <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
