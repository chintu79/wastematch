"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Save, FileText, Package, TestTube, Truck } from "lucide-react";

const STEPS = [
  { id: "basic", name: "Basic Info", icon: Package },
  { id: "technical", name: "Technical Properties", icon: TestTube },
  { id: "logistics", name: "Logistics & Storage", icon: Truck },
  { id: "regulatory", name: "Regulatory Docs", icon: FileText },
];

export default function NewListingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    description: "",
    chemicalPurity: "",
    moistureContent: "",
    physicalState: "SOLID",
    packagingType: "BALED",
    transportMode: "ROAD",
    quantity: "",
    documents: [],
  });

  // Mock Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.description) {
        setIsSaving(true);
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
        }, 500);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-64px)] bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Create Material Listing</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            {isSaving ? (
              <span className="flex items-center"><Save className="w-4 h-4 mr-1 animate-pulse" /> Saving draft...</span>
            ) : lastSaved ? (
              <span className="flex items-center"><Check className="w-4 h-4 mr-1 text-green-500" /> Draft saved at {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>Draft not saved yet</span>
            )}
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Stepper */}
        <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
          <ul className="space-y-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <li key={step.id} className="relative">
                  <div className={`flex items-center group cursor-pointer ${isActive ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`} onClick={() => setCurrentStep(index)}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isActive ? 'border-green-600 bg-green-50' : isCompleted ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                      {isCompleted ? <Check className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${isActive ? 'text-green-600' : ''}`}>{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`absolute top-8 left-4 w-px h-6 -ml-px ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h2 className="text-lg font-bold border-b pb-2 mb-4">1. Basic Information</h2>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="e.g. Baled PET Bottles - Post Consumer"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material Category</label>
                  <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500">
                    <option value="">Select a category...</option>
                    <option value="PLASTICS">Plastics</option>
                    <option value="METALS">Metals</option>
                    <option value="PAPER">Paper & Cardboard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe the origin and general condition of the waste..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">2. Technical Properties</h2>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-sm text-blue-700">These fields are dynamically loaded based on the &quot;Plastics&quot; category.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chemical Purity (%)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-md p-2" placeholder="99.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moisture Content (%)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-md p-2" placeholder="< 2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physical State</label>
                  <div className="flex space-x-4">
                    {['SOLID', 'LIQUID', 'SLUDGE', 'GAS'].map(state => (
                      <label key={state} className="flex items-center space-x-2">
                        <input type="radio" name="state" className="text-green-600 focus:ring-green-500" defaultChecked={state === 'SOLID'} />
                        <span className="text-sm">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">3. Logistics & Storage</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Type</label>
                  <select className="w-full border border-gray-300 rounded-md p-2">
                    <option>Baled</option>
                    <option>Loose/Bulk</option>
                    <option>Drums (55 gal)</option>
                    <option>IBC Totes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity (Tons)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-md p-2" placeholder="500" />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">4. Regulatory & Documents</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <span className="mt-2 block text-sm font-semibold text-gray-900">Upload Lab Analysis & Safety Data Sheets</span>
                  <span className="mt-1 block text-sm text-gray-500">PDF, JPG, PNG up to 10MB</span>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-10 pt-6 border-t flex justify-between">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              {currentStep < STEPS.length - 1 ? (
                <button 
                  onClick={handleNext}
                  className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 flex items-center"
                >
                  Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button 
                  className="px-6 py-2 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 shadow-sm"
                >
                  Publish Listing
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
