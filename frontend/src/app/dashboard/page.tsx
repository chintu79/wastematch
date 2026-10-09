"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Factory, Recycle } from "lucide-react";

export default function DashboardDemoRouter() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Select Your Dashboard View</h1>
        <p className="text-center text-gray-600 mb-12">
          In a production environment, you would be automatically routed here based on your organization's \`OrgType\`.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/producer" className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all group hover:border-green-300">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Factory className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Producer Dashboard</h2>
            <p className="text-gray-600 mb-6 line-clamp-2">
              Focuses on inventory management, active inquiries on waste listings, and strict compliance tracking.
            </p>
            <div className="flex items-center text-green-600 font-medium">
              <span>View Producer UX</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/dashboard/buyer" className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all group hover:border-blue-300">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Recycle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Recycler (Buyer) Dashboard</h2>
            <p className="text-gray-600 mb-6 line-clamp-2">
              Focuses on managing buying specifications, finding high-compatibility matches, and requesting samples.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>View Buyer UX</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
