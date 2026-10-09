"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Constraint {
  name: string;
  required: string;
  actual: string;
  status: "pass" | "warn" | "fail";
}

interface BreakdownCategory {
  category: string;
  score: number;
  constraints: Constraint[];
}

export default function CompatibilityScoreCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data for demonstration
  const overallScore = 94;
  const breakdown: BreakdownCategory[] = [
    {
      category: "Chemical Properties",
      score: 100,
      constraints: [
        { name: "Copper Purity", required: "> 98%", actual: "99.2%", status: "pass" },
        { name: "Lead Content", required: "< 0.5%", actual: "0.1%", status: "pass" },
      ]
    },
    {
      category: "Physical & Logistics",
      score: 85,
      constraints: [
        { name: "Moisture Content", required: "< 2%", actual: "2.5%", status: "warn" },
        { name: "Packaging", required: "Baled", actual: "Baled", status: "pass" },
      ]
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "warn") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Header Summary */}
      <div className="p-4 flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}% Match
            </div>
            <h3 className="text-lg font-bold text-gray-900">High-Purity Copper Slag</h3>
          </div>
          <p className="text-sm text-gray-500">Industrial Metals Corp • 45 miles away</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4 animate-in slide-in-from-top-2">
          <p className="text-sm text-gray-600 mb-2">Algorithm Evaluation Breakdown:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakdown.map((group, idx) => (
              <div key={idx} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <span className="font-semibold text-sm text-gray-800">{group.category}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getScoreColor(group.score)}`}>
                    {group.score}%
                  </span>
                </div>
                
                <ul className="space-y-2">
                  {group.constraints.map((c, cIdx) => (
                    <li key={cIdx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(c.status)}
                        <span className="text-gray-700">{c.name}</span>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-gray-400 mr-2">Req: {c.required}</span>
                        <span className={`font-medium ${c.status === 'warn' ? 'text-yellow-600' : 'text-gray-900'}`}>
                          Act: {c.actual}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
             <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
               View Full Details
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
