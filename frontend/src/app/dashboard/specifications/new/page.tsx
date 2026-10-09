"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Save, Settings, Package, Truck, AlertCircle, FileText } from "lucide-react";

const STEPS = [
  { id: "category", name: "Material Category", icon: Package },
  { id: "use", name: "Industrial Use", icon: FileText },
  { id: "mandatory", name: "Required (Hard Constraints)", icon: AlertCircle },
  { id: "optional", name: "Preferred (Soft Constraints)", icon: Settings },
  { id: "logistics", name: "Quantity & Location", icon: Truck },
  { id: "review", name: "Review & Publish", icon: Check },
];

export default function NewSpecificationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    intendedUse: "",
    mandatoryConstraints: [{ property: "", operator: "=", value: "" }],
    optionalConstraints: [{ property: "", operator: "=", value: "" }],
    quantity: "",
    location: "",
  });

  // Mock Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.category || formData.intendedUse) {
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
          <h1 className="text-xl font-bold">Create Buyer Specification</h1>
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
        <div className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col justify-between overflow-y-auto">
          <ul className="space-y-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <li key={step.id} className="relative">
                  <div className={`flex items-center group cursor-pointer ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`} onClick={() => setCurrentStep(index)}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isActive ? 'border-blue-600 bg-blue-50' : isCompleted ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {isCompleted ? <Check className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600' : ''}`}>{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`absolute top-8 left-4 w-px h-6 -ml-px ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`} />
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
                <h2 className="text-lg font-bold border-b pb-2 mb-4">1. Material Category</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What type of raw material are you looking for?</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select a category...</option>
                    <option value="PLASTICS">Plastics & Polymers</option>
                    <option value="METALS">Metals & Scrap</option>
                    <option value="PAPER">Paper & Cardboard</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">2. Industrial Use</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Describe your intended industrial use</label>
                  <textarea 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., We use this material as an additive in cement manufacturing..."
                    value={formData.intendedUse}
                    onChange={e => setFormData({...formData, intendedUse: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-2">This helps our algorithm understand the context of your requirements and suggest alternative materials if a direct match isn&apos;t found.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">3. Mandatory Requirements (Hard Constraints)</h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-sm text-red-700 font-medium">Any material that fails these exact constraints will be strictly rejected by the matching engine.</p>
                </div>
                
                {formData.mandatoryConstraints.map((constraint, index) => (
                  <div key={index} className="flex space-x-2 items-center mb-2">
                    <input type="text" placeholder="Property (e.g. Moisture)" className="flex-1 border border-gray-300 rounded-md p-2 text-sm" />
                    <select className="w-20 border border-gray-300 rounded-md p-2 text-sm">
                      <option>&lt;</option>
                      <option>&gt;</option>
                      <option>=</option>
                    </select>
                    <input type="text" placeholder="Value (e.g. 2%)" className="flex-1 border border-gray-300 rounded-md p-2 text-sm" />
                  </div>
                ))}
                <button className="text-blue-600 text-sm font-medium hover:underline">+ Add Mandatory Constraint</button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">4. Preferred (Soft Constraints)</h2>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-sm text-blue-700 font-medium">These constraints are not deal-breakers. The matching engine will use them to score and rank compatible materials.</p>
                </div>
                
                {formData.optionalConstraints.map((constraint, index) => (
                  <div key={index} className="flex space-x-2 items-center mb-2">
                    <input type="text" placeholder="Property (e.g. Color)" className="flex-1 border border-gray-300 rounded-md p-2 text-sm" />
                    <select className="w-20 border border-gray-300 rounded-md p-2 text-sm">
                      <option>=</option>
                      <option>in</option>
                    </select>
                    <input type="text" placeholder="Value (e.g. Clear/Blue)" className="flex-1 border border-gray-300 rounded-md p-2 text-sm" />
                  </div>
                ))}
                <button className="text-blue-600 text-sm font-medium hover:underline">+ Add Preferred Constraint</button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">5. Quantity & Location</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Quantity (Tons/Mo)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. 100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Sourcing Radius (km)</label>
                    <input type="number" className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. 50" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-lg font-bold border-b pb-2 mb-4">6. Review & Publish</h2>
                
                {/* Blockers check */}
                {!formData.category && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm"><strong>Blocker:</strong> You must select a Material Category before publishing this specification.</p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">Specification Summary</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li><strong>Category:</strong> {formData.category || "Not selected"}</li>
                    <li><strong>Intended Use:</strong> {formData.intendedUse ? "Provided" : "Not provided"}</li>
                    <li><strong>Hard Constraints:</strong> 1 defined</li>
                    <li><strong>Soft Constraints:</strong> 1 defined</li>
                  </ul>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 flex items-center"
                >
                  Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button 
                  disabled={!formData.category}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publish Specification
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
