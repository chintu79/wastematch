"use client";

import { useState } from "react";
import { Search, Compass, MapPin, Tag, TrendingUp, Filter, ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const [isSearching, setIsSearching] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const categories = [
    { name: "Metals & Alloys", count: 124, color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Plastics & Polymers", count: 89, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Construction Debris", count: 210, color: "bg-amber-50 text-amber-700 border-amber-200" },
    { name: "Electronic Waste", count: 45, color: "bg-purple-50 text-purple-700 border-purple-200" },
    { name: "Chemical Byproducts", count: 32, color: "bg-rose-50 text-rose-700 border-rose-200" },
    { name: "Paper & Cardboard", count: 156, color: "bg-orange-50 text-orange-700 border-orange-200" },
  ];

  const recentListings = [
    { id: "LST-9021", title: "Copper Slag - High Purity", facility: "Pune MIDC", qty: "120 Tons", category: "Metals & Alloys", price: "₹2,400/ton" },
    { id: "LST-9022", title: "Clear PET Flakes (Washed)", facility: "Chakan Plant", qty: "45 Tons", category: "Plastics & Polymers", price: "₹45,000/ton" },
    { id: "LST-9023", title: "Crushed Concrete Aggregate", facility: "Navi Mumbai", qty: "500 Tons", category: "Construction Debris", price: "₹400/ton" },
    { id: "LST-9024", title: "Shredded PCB Boards", facility: "Bangalore Hub", qty: "2.5 Tons", category: "Electronic Waste", price: "Request Quote" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Found 14 new matches in your area!</span>
      </div>

      {/* Header */}
      <div className="bg-emerald-900 text-white pt-10 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Compass className="w-96 h-96 -mt-20 -mr-20" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center text-emerald-200 hover:text-white font-medium text-sm mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore the Marketplace</h1>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl">Discover secondary raw materials, industrial byproducts, and recycling opportunities across thousands of verified facilities.</p>
          
          <div className="flex flex-col md:flex-row max-w-2xl bg-white rounded-lg p-1.5 shadow-xl ring-4 ring-emerald-800/30">
            <div className="flex-1 flex items-center px-4 py-2 md:py-0">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input type="text" placeholder="Search materials (e.g., 'Copper Slag', 'PET')" className="w-full py-2 bg-transparent text-slate-900 focus:outline-none placeholder-slate-400" />
            </div>
            <div className="hidden md:flex items-center px-4 border-l border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400 mr-2" />
              <input type="text" placeholder="Location" className="w-32 py-2 bg-transparent text-slate-900 focus:outline-none placeholder-slate-400" />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className={`bg-emerald-600 text-white px-8 py-3 rounded-md font-bold transition-all ${isSearching ? 'opacity-70 cursor-wait' : 'hover:bg-emerald-500 hover:shadow-lg active:scale-95'}`}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-emerald-600" /> Browse by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <div key={idx} className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all text-center ${cat.color}`}>
                <h3 className="font-bold text-sm mb-1">{cat.name}</h3>
                <p className="text-xs opacity-80">{cat.count} listings</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending / Recent Listings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" /> Newly Listed Materials
            </h2>
            <button className="text-sm font-medium text-emerald-600 flex items-center hover:text-emerald-700 hover:underline">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((listing, idx) => (
              <Link href={`/dashboard/listings/${listing.id}`} key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform duration-500">
                    <Compass className="w-16 h-16 opacity-50" />
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-slate-700 border border-slate-200">
                    {listing.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">{listing.title}</h3>
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <MapPin className="w-3 h-3 mr-1" /> {listing.facility}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="font-semibold text-slate-800">{listing.qty}</div>
                    <div className="text-emerald-700 font-bold">{listing.price}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
