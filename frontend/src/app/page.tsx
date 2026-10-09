"use client";

import Link from "next/link";
import { Search, ChevronRight, Package, Recycle, Truck, Factory, ArrowRight, FlaskConical, Box, Leaf } from "lucide-react";

const CATEGORIES = [
  { name: "Metals & Scrap", icon: Factory, color: "bg-orange-100 text-orange-600" },
  { name: "Plastics & Polymers", icon: Box, color: "bg-blue-100 text-blue-600" },
  { name: "Paper & Cardboard", icon: Package, color: "bg-yellow-100 text-yellow-600" },
  { name: "Organic By-products", icon: Leaf, color: "bg-green-100 text-green-600" },
  { name: "Construction Materials", icon: Truck, color: "bg-stone-100 text-stone-600" },
  { name: "Industrial Residues", icon: FlaskConical, color: "bg-purple-100 text-purple-600" },
];

const SAMPLE_LISTINGS = [
  { id: 1, title: "Clean PET Bottles - Baled", location: "Pune, Maharashtra", quantity: "50 Tons/Month", category: "Plastics", price: "Request Quote", tag: "NABL Verified" },
  { id: 2, title: "High-Purity Copper Slag", location: "Bhosari MIDC", quantity: "200 Tons", category: "Metals", price: "₹2,500 / Ton", tag: "Ready to Ship" },
  { id: 3, title: "Organic Food Processing Residue", location: "Chakan Industrial Area", quantity: "15 Tons/Week", category: "Organic", price: "Negotiable", tag: "High Moisture" },
  { id: 4, title: "Corrugated Cardboard Scrap", location: "Talegaon Dabhade", quantity: "30 Tons", category: "Paper", price: "Request Quote", tag: "Baled" },
];

export default function MarketplaceHome() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-green-700" />
            <span className="text-xl font-black tracking-tight text-slate-900">
              Waste<span className="text-green-700">Match</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/register" className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Section 1: Search-First Hero */}
      <section className="bg-slate-50 border-b border-slate-200 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Turn industrial waste into a resource.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Discover materials, connect with buyers, and find opportunities for reuse and recycling.
          </p>
          
          <div className="relative max-w-2xl mx-auto shadow-sm rounded-full bg-white border border-slate-300 p-2 flex items-center mb-6">
            <div className="pl-4">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search metal scrap, plastic granules, fly ash…" 
              className="w-full pl-3 pr-4 py-3 bg-transparent text-base focus:outline-none text-slate-900"
            />
            <button className="bg-green-700 hover:bg-green-800 text-white rounded-full px-6 py-3 font-semibold transition-colors flex-shrink-0">
              Search
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard/buyer" className="hover:text-green-700 transition-colors">Browse materials</Link>
            <span className="text-slate-300">|</span>
            <Link href="/dashboard/producer/listings/new" className="hover:text-green-700 transition-colors">List your material</Link>
          </div>
        </div>
      </section>

      {/* Section 2: Browse by Category */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Browse by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link key={i} href="/dashboard/buyer" className="group flex flex-col items-center p-6 border border-slate-200 rounded-xl hover:shadow-md hover:border-green-300 transition-all text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Available Materials (Product Grid) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Recently listed materials</h2>
            <Link href="/dashboard/buyer" className="text-sm font-semibold text-green-700 hover:text-green-800 flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_LISTINGS.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <div className="h-48 bg-slate-200 flex items-center justify-center relative">
                  <Package className="w-12 h-12 text-slate-400" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-800 shadow-sm">
                    {item.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3 flex-1">{item.location}</p>
                  
                  <div className="flex justify-between items-center text-sm font-medium text-slate-700 mb-4 bg-slate-50 p-2 rounded">
                    <span>{item.quantity}</span>
                    <span className="text-green-700">{item.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                      {item.tag}
                    </span>
                    <button className="text-sm font-bold text-slate-700 hover:text-green-700">Details &rarr;</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: How WasteMatch Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How WasteMatch works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xl mb-6">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Discover or List</h3>
              <p className="text-slate-600">Search for required raw materials or easily list your industrial by-products on the marketplace.</p>
            </div>
            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
              <div className="hidden md:block absolute top-8 -right-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl mb-6 bg-white border-[8px] border-white">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Check Technical Fit</h3>
              <p className="text-slate-600">Our engine verifies chemical properties, required evidence, and regulatory constraints automatically.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xl mb-6">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Connect & Qualify</h3>
              <p className="text-slate-600">Contact the business directly through our unified inbox to negotiate terms and request samples.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Supplier CTA */}
      <section className="py-16 bg-slate-900 text-white mt-auto">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a material to recover or sell?</h2>
          <p className="text-slate-300 mb-8 text-lg">Join hundreds of industrial plants turning waste costs into revenue streams.</p>
          <Link href="/dashboard/producer/listings/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-8 py-4 text-base font-bold text-white hover:bg-green-500 transition-colors">
            List your material <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      
    </div>
  );
}
