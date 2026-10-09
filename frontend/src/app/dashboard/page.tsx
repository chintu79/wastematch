'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProducerDashboard } from '@/components/dashboard/ProducerDashboard';
import { BuyerDashboard } from '@/components/dashboard/BuyerDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { role, switchRole, user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Quick Role-Switching Banner for UI Reviewers */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Role Context Switcher (Review Mode)
              </p>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Currently previewing dashboard as:{' '}
              <span className="font-semibold text-emerald-800">
                {user?.display_name} ({user?.organization?.name})
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">Switch view to:</span>
            <button
              type="button"
              onClick={() => switchRole('waste_supplier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'waste_supplier'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Producer (Generator)
            </button>
            <button
              type="button"
              onClick={() => switchRole('buyer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'buyer'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Buyer (Consumer)
            </button>
            <button
              type="button"
              onClick={() => switchRole('recycler')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'recycler'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Recycler (Processor)
            </button>
            <button
              type="button"
              onClick={() => switchRole('platform_admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'platform_admin'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Admin / Regulator
            </button>
          </div>
        </div>
      </div>

      {/* Render Dynamic View Based on Active Role */}
      {role === 'waste_supplier' && <ProducerDashboard />}
      {(role === 'buyer' || role === 'recycler') && <BuyerDashboard />}
      {role === 'platform_admin' && <AdminDashboard />}
    </div>
  );
}
