"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, FileText, CheckCircle2, ShieldCheck, MapPin, Download, 
  MessageSquare, Heart, Share2, Info, CheckCircle, PackageOpen, Truck 
} from "lucide-react";

export default function MaterialListingDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data representing the material
  const material = {
    id: "MAT-2049",
    title: "High-Purity Copper Slag",
    category: "Metals",
    seller: "Industrial Metals Corp",
    location: "Bhosari MIDC, Pune",
    quantity: "200 Tons",
    availability: "Immediate",
    price: "₹2,500 / Ton",
    description: "By-product of copper smelting process. Mechanically granulated and water-quenched. Suitable for abrasive grit manufacturing, roofing granules, and Portland cement additive. Free from hazardous heavy metals beyond permissible limits.",
    process: "Flash smelting of copper concentrates",
    specifications: [
      { name: "Copper (Cu)", value: "0.8 - 1.2%", method: "XRF", verified: true },
      { name: "Iron Oxide (FeO)", value: "40 - 50%", method: "XRF", verified: true },
      { name: "Silica (SiO2)", value: "30 - 35%", method: "Wet Analysis", verified: true },
      { name: "Moisture", value: "< 0.5%", method: "Gravimetric", verified: true },
      { name: "Specific Gravity", value: "3.5", method: "ASTM C128", verified: false },
    ],
    documents: [
      { id: 1, name: "NABL Lab Test Report - Composition", date: "Oct 2026", size: "1.2 MB", type: "PDF" },
      { id: 2, name: "Safety Data Sheet (SDS)", date: "Jan 2026", size: "850 KB", type: "PDF" },
      { id: 3, name: "MPCB Authorization Form", date: "Mar 2026", size: "2.1 MB", type: "PDF" },
    ]
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard/buyer/matches" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to matches
          </Link>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {material.category}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Seller
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                {material.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <span className="font-medium text-gray-900">{material.seller}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {material.location}</span>
                <span>ID: {material.id}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Available Quantity</p>
                  <p className="font-bold text-gray-900">{material.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Availability</p>
                  <p className="font-bold text-gray-900">{material.availability}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Packaging</p>
                  <p className="font-bold text-gray-900">Bulk</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Price</p>
                  <p className="font-bold text-green-700">{material.price}</p>
                </div>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
                {['overview', 'specifications', 'documents', 'qualification'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                      activeTab === tab 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{material.description}</p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                      <div>
                        <h4 className="flex items-center text-sm font-bold text-gray-900 mb-2">
                          <PackageOpen className="w-4 h-4 mr-2 text-gray-400" /> Origin Process
                        </h4>
                        <p className="text-sm text-gray-600">{material.process}</p>
                      </div>
                      <div>
                        <h4 className="flex items-center text-sm font-bold text-gray-900 mb-2">
                          <Truck className="w-4 h-4 mr-2 text-gray-400" /> Logistics Info
                        </h4>
                        <p className="text-sm text-gray-600">Minimum pickup 10 Tons. Forklift available on site. Loading hours: 9AM - 5PM Mon-Sat.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Specifications Tab */}
                {activeTab === 'specifications' && (
                  <div className="animate-in fade-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Chemical & Physical Properties</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Property</th>
                            <th className="px-4 py-3 font-semibold">Value</th>
                            <th className="px-4 py-3 font-semibold">Test Method</th>
                            <th className="px-4 py-3 font-semibold text-right">Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {material.specifications.map((spec, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-gray-900">{spec.name}</td>
                              <td className="px-4 py-3 text-gray-600">{spec.value}</td>
                              <td className="px-4 py-3 text-gray-500">{spec.method}</td>
                              <td className="px-4 py-3 text-right">
                                {spec.verified ? (
                                  <span className="inline-flex items-center text-emerald-600 text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> NABL Verified
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Self-reported</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="animate-in fade-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Available Documents</h3>
                    <div className="space-y-3">
                      {material.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-white">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{doc.type} • {doc.size} • Uploaded {doc.date}</p>
                            </div>
                          </div>
                          <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors">
                            <Download className="w-4 h-4 mr-1.5" /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qualification Tab */}
                {activeTab === 'qualification' && (
                  <div className="animate-in fade-in space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-emerald-900 mb-1">Eligible for MPCB Transfer</h4>
                        <p className="text-sm text-emerald-800">Your organization has the required licenses to receive and process this category of material under current state regulations.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Next Steps</h4>
                      <ol className="relative border-l border-gray-200 ml-3 space-y-5">                  
                        <li className="pl-6 relative">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-4 ring-white text-blue-600 font-bold text-xs">1</span>
                          <h5 className="font-semibold text-gray-900 text-sm">Request Sample</h5>
                          <p className="text-sm text-gray-500 mt-1">Contact the supplier to arrange a physical sample for in-house testing.</p>
                        </li>
                        <li className="pl-6 relative">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-4 ring-white text-gray-500 font-bold text-xs">2</span>
                          <h5 className="font-semibold text-gray-900 text-sm">Agree on Terms</h5>
                          <p className="text-sm text-gray-500 mt-1">Negotiate price, logistics, and recurring volume.</p>
                        </li>
                        <li className="pl-6 relative">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-4 ring-white text-gray-500 font-bold text-xs">3</span>
                          <h5 className="font-semibold text-gray-900 text-sm">Manifest Generation</h5>
                          <p className="text-sm text-gray-500 mt-1">Platform automatically generates MPCB Form-10 manifests for dispatch.</p>
                        </li>
                      </ol>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Action Panel) */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Interested in this material?</h3>
                <p className="text-sm text-gray-600 mb-6">Contact the supplier directly to request samples, ask technical questions, or negotiate terms.</p>
                
                <Link 
                  href="/dashboard/inbox" 
                  className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors mb-3"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Request Information
                </Link>
                
                <button className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors">
                  <Bookmark className="w-4 h-4 mr-2 text-gray-400" /> Save for later
                </button>
                
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center text-xs text-gray-500">
                  <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                  <p>All communications are tracked to ensure regulatory compliance and platform safety.</p>
                </div>
              </div>

              {/* Related/Similar Materials (Optional Sidebar Widget) */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h4 className="font-bold text-gray-800 text-sm mb-4">Similar Materials</h4>
                <div className="space-y-3">
                  <div className="group cursor-pointer">
                    <p className="text-sm font-semibold text-blue-600 group-hover:underline">Granulated Blast Furnace Slag</p>
                    <p className="text-xs text-gray-500">Tata Steel BSL • 500 Tons</p>
                  </div>
                  <div className="group cursor-pointer">
                    <p className="text-sm font-semibold text-blue-600 group-hover:underline">Zinc Slag Residue</p>
                    <p className="text-xs text-gray-500">Hindustan Zinc • 150 Tons</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Re-implement the lucide Bookmark icon since it wasn't imported above
function Bookmark(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
