'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Layers, ArrowRight, ShieldCheck, Factory, Sparkles, Building } from 'lucide-react';
import { UserRole } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemoRole, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please enter your work email.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrorMessage(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    loginAsDemoRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900">WasteMatch</span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
          Sign in to your industrial portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter credentials to manage waste listings, specifications, and regulatory clearance.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password recovery: A reset link will be sent to your verified work email.')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* 1-Click Demo Profiles for Reviewers */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Sign In
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                For Reviewer
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('waste_supplier')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <Factory className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                    Producer
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Tata AutoComp</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('buyer')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-blue-700" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                    Buyer
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Bharat Forge</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('recycler')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-teal-50 hover:border-teal-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-teal-900">
                    Recycler
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">EcoRecycle MH</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('platform_admin')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-purple-50 hover:border-purple-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-purple-900">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">MPCB Reviewer</p>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an enterprise account yet?{' '}
            <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Register organization
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800">
            ← Back to WasteMatch Home
          </Link>
        </div>
      </div>
    </div>
  );
}
