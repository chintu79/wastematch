'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  Search,
  SlidersHorizontal,
  GitCompare,
  MessageSquare,
  FileText,
  Building,
  ShieldAlert,
  Users,
  Settings,
  Sparkles,
  Award,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { role, user } = useAuth();

  // Navigation schema filtered by role conforming to UI-UX.md § 4.2
  const getNavSections = () => {
    switch (role) {
      case 'waste_supplier':
        return [
          {
            title: 'Material Management',
            items: [
              { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
              { label: 'My Listings', href: '/dashboard/listings', icon: Boxes },
              { label: 'Material Batches', href: '/dashboard/batches', icon: Layers },
            ],
          },
          {
            title: 'Exchange & Matches',
            items: [
              { label: 'Candidate Buyers', href: '/dashboard/matches', icon: Sparkles },
              { label: 'Inquiries & RFQs', href: '/dashboard/inquiries', icon: MessageSquare, badge: '3' },
              { label: 'Documents & Lab Reports', href: '/dashboard/documents', icon: FileText },
            ],
          },
          {
            title: 'Organization',
            items: [
              { label: 'Facility Profile', href: '/dashboard/organization', icon: Building },
              { label: 'Settings', href: '/dashboard/settings', icon: Settings },
            ],
          },
        ];

      case 'buyer':
      case 'recycler':
        return [
          {
            title: 'Sourcing & Requirements',
            items: [
              { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
              { label: 'Find Materials', href: '/dashboard/discover', icon: Search },
              { label: 'My Specifications', href: '/dashboard/specifications', icon: SlidersHorizontal },
            ],
          },
          {
            title: 'Evaluations & Deals',
            items: [
              { label: 'Candidate Matches', href: '/dashboard/matches', icon: GitCompare, badge: '12' },
              { label: 'Inquiries & Samples', href: '/dashboard/inquiries', icon: MessageSquare, badge: '5' },
              { label: 'Evidence & Compliance', href: '/dashboard/documents', icon: FileText },
            ],
          },
          {
            title: 'Organization',
            items: [
              { label: 'Receiving Facilities', href: '/dashboard/organization', icon: Building },
              { label: 'Settings', href: '/dashboard/settings', icon: Settings },
            ],
          },
        ];

      case 'platform_admin':
        return [
          {
            title: 'Governance & Audits',
            items: [
              { label: 'Admin Overview', href: '/dashboard', icon: LayoutDashboard },
              { label: 'Organization Verification', href: '/dashboard/admin/organizations', icon: Users, badge: '4' },
              { label: 'Material Listings Queue', href: '/dashboard/admin/listings', icon: Boxes, badge: '8' },
            ],
          },
          {
            title: 'Compliance & Rules',
            items: [
              { label: 'Regulatory Evaluations', href: '/dashboard/admin/compliance', icon: ShieldAlert, badge: '2' },
              { label: 'Rule Registry (MPCB/CPCB)', href: '/dashboard/admin/rules', icon: Award },
              { label: 'Platform Audit Log', href: '/dashboard/admin/audit', icon: FileText },
            ],
          },
          {
            title: 'System',
            items: [
              { label: 'Platform Settings', href: '/dashboard/settings', icon: Settings },
            ],
          },
        ];
    }
  };

  const sections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </h4>
              <nav className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-slate-150 text-slate-700 bg-slate-100'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Facility Verification Status Pill at the bottom */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-slate-800">
                {user?.organization?.verification_status === 'verified'
                  ? 'Facility Verified'
                  : 'Verification In Review'}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              MPCB Consent to Operate active for Bhosari & Chakan clusters.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
