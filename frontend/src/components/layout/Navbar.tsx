'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { 
  Building2, 
  ChevronDown, 
  LogOut, 
  Bell, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  User as UserIcon,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { user, role, switchRole, logout, activeFacility } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badgeClass: string; desc: string }> = {
    waste_supplier: {
      label: 'Producer / Generator',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      desc: 'Lists available industrial waste lots',
    },
    buyer: {
      label: 'Industrial Buyer',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      desc: 'Sources secondary raw materials & specs',
    },
    recycler: {
      label: 'Processor / Recycler',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      desc: 'Recovers, pretreats & refines feedstock',
    },
    platform_admin: {
      label: 'Regulatory Reviewer / Admin',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      desc: 'Audits compliance & verifies organizations',
    },
  };

  const notifications = [
    {
      id: '1',
      title: 'New Matching Inquiry',
      description: 'Bharat Forge requested technical data sheet for Foundry Sand lot #FS-2026-08',
      time: '18m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Consent Renewal Reminder',
      description: 'MPCB Air/Water consent valid until Q1 2027. Routine audit scheduled.',
      time: '2h ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Menu Toggle & Organization Info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 mr-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">WasteMatch</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                PCMC Pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Industrial Symbiosis Exchange</p>
          </div>
        </Link>

        {/* Current Active Facility Pill */}
        {user?.organization && (
          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs">
            <Building2 className="h-4 w-4 text-slate-400" />
            <div>
              <span className="font-semibold text-slate-800">{user.organization.name}</span>
              {activeFacility && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  <span>{activeFacility.name} ({activeFacility.location})</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Role Switcher & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Interactive Role Switcher Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsRoleMenuOpen(!isRoleMenuOpen);
              setIsProfileOpen(false);
              setIsNotifOpen(false);
            }}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${roleLabels[role].badgeClass} hover:opacity-90`}
            title="Click to switch preview role"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">Role:</span>
            <span className="font-semibold">{roleLabels[role].label.split('/')[0].trim()}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Switch Role View</p>
                <p className="text-[11px] text-slate-500">
                  Test the platform experience from different stakeholder perspectives
                </p>
              </div>
              <div className="py-1 space-y-1">
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      switchRole(r);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                      role === r
                        ? 'bg-emerald-50 text-emerald-950 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{roleLabels[r].label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{roleLabels[r].desc}</p>
                    </div>
                    {role === r && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
              setIsRoleMenuOpen(false);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  2 Updates
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsRoleMenuOpen(false);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold ring-1 ring-slate-300">
              {user?.display_name ? user.display_name.charAt(0) : 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.display_name || 'Guest User'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.display_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                {user?.designation && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    {user.designation}
                  </p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>Account & Organization</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
