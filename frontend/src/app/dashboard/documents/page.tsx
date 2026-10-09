"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle2, AlertTriangle, UploadCloud } from "lucide-react";

export default function DocumentsPage() {
  const [showToast, setShowToast] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);

  const handleUpload = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownload = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3000);
  };

  const documents = [
    { id: 1, name: "NABL Purity Analysis Report", type: "Test Report", material: "Copper Slag", date: "Oct 1, 2026", valid: true },
    { id: 2, name: "Material Safety Data Sheet (MSDS)", type: "Safety Doc", material: "Copper Slag", date: "Jan 15, 2026", valid: true },
    { id: 3, name: "MPCB Waste Transfer Consent", type: "Regulatory", material: "Multiple", date: "Mar 10, 2025", valid: false },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50 text-gray-900 max-w-7xl mx-auto min-h-screen relative">
      {/* Toast Notifications */}
      <div className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-sm">Document uploaded and pending OCR review.</span>
      </div>
      <div className={`fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform ${downloadToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <Download className="w-5 h-5 text-blue-400" />
        <span className="font-medium text-sm">Downloading secure PDF...</span>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><FileText className="w-6 h-6 mr-2 text-blue-600" /> Documents & Lab Reports</h1>
          <p className="text-gray-600 text-sm mt-1">Manage certifications, safety data sheets, and compliance evidence.</p>
        </div>
        <button onClick={handleUpload} className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-500 hover:shadow-lg active:scale-95 transition-all font-medium">
          <UploadCloud className="w-4 h-4" /> <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                <FileText className="w-6 h-6" />
              </div>
              {doc.valid ? (
                <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1" /> Valid</span>
              ) : (
                <span className="flex items-center text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3 mr-1" /> Expired</span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-700 transition-colors">{doc.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{doc.type} • {doc.material}</p>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
              <span className="text-xs text-gray-400">Uploaded {doc.date}</span>
              <button onClick={handleDownload} className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-100 transition-colors active:scale-90">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
