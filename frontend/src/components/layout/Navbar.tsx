'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  X,
  Search,
  Compass,
  PlusSquare,
  Activity
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const pathname = usePathname();

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
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
        
        {/* Left: Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg pr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 shadow-sm transition-transform group-hover:scale-105">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[15px] font-extrabold tracking-tight text-slate-900 leading-none block">
                WasteMatch
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) & Mobile Search Toggle */}
        <div className="flex-1 max-w-2xl px-4 md:px-8 hidden md:block">
          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search materials by name, category, or location"
              className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white text-sm text-slate-900 rounded-full pl-10 pr-4 py-2 border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Mobile Search Input (Visible when toggled) */}
        {isMobileSearchOpen && (
          <div className="absolute inset-0 bg-white z-40 flex items-center px-4 h-16 border-b border-slate-200 md:hidden">
            <Search className="absolute left-7 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              autoFocus
              placeholder="Search materials..."
              className="w-full bg-slate-100 text-sm text-slate-900 rounded-full pl-10 pr-10 py-2 outline-none"
            />
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="absolute right-6 p-1 text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-3">
          
          {/* Mobile Search Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 mr-2 border-r border-slate-200 pr-4">
            <Link 
              href="/explore" 
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${pathname.includes('/explore') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Explore
            </Link>
            {user && (role === 'waste_supplier' || role === 'recycler') && (
              <Link 
                href="/dashboard/listings/new" 
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${pathname.includes('/listings/new') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                List Material
              </Link>
            )}
            {user && role === 'buyer' && (
              <Link 
                href="/buyers" 
                className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Find Buyers
              </Link>
            )}
            {user && (
              <Link 
                href="/dashboard" 
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${pathname === '/dashboard' || pathname.includes('/activity') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                My Activity
              </Link>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
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
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-full p-1 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold ring-1 ring-emerald-200">
                {user?.display_name ? user.display_name.charAt(0) : 'U'}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{user.display_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {user.organization && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                           <Building2 className="h-3.5 w-3.5 text-slate-400" />
                           <span className="font-semibold truncate">{user.organization.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Developer / Demo Role Switcher relocated inside Profile Menu */}
                    <div className="py-2 border-b border-slate-100 px-1">
                      <div className="px-2 pb-1.5 flex items-center justify-between">
                         <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">View As (Demo)</p>
                         <ShieldCheck className="h-3 w-3 text-slate-400" />
                      </div>
                      <div className="space-y-0.5">
                        {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              switchRole(r);
                              setIsRoleMenuOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                              role === r
                                ? 'bg-emerald-50 text-emerald-950 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span>{roleLabels[r].label.split('/')[0].trim()}</span>
                            {role === r && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <UserIcon className="h-4 w-4 text-slate-500" />
                        <span>Account settings</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                     <Link
                        href="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg mb-1"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        Create Account
                      </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 pb-safe">
          <Link href="/explore" className={`flex flex-col items-center justify-center w-16 gap-1 ${pathname.includes('/explore') ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'}`}>
            <Compass className="h-5 w-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>
          <button onClick={() => { setIsMobileSearchOpen(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="flex flex-col items-center justify-center w-16 gap-1 text-slate-500 hover:text-slate-900">
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          
          {user && (role === 'waste_supplier' || role === 'recycler') && (
            <Link href="/dashboard/listings/new" className="flex flex-col items-center justify-center -mt-5 relative z-50">
              <div className="bg-emerald-600 text-white p-3 rounded-full shadow-lg shadow-emerald-600/30">
                <PlusSquare className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 mt-1">List</span>
            </Link>
          )}

          <Link href="/dashboard" className={`flex flex-col items-center justify-center w-16 gap-1 ${pathname === '/dashboard' || pathname.includes('/activity') ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'}`}>
            <Activity className="h-5 w-5" />
            <span className="text-[10px] font-medium">Activity</span>
          </Link>
      </div>
    </>
  );
};
