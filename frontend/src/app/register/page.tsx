'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types/auth';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  UserCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
    organization_name: '',
    organization_type: 'waste_generator' as 'waste_generator' | 'buyer' | 'waste_processor' | 'recycler',
    role: 'waste_supplier' as UserRole,
    industrial_zone: 'Bhosari MIDC',
    city: 'Pimpri-Chinchwad, Pune',
    facility_name: '',
  });

  const [error, setError] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.display_name || !formData.email || !formData.password) {
      setError('Please fill in all required personal details.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleOrgTypeChange = (val: string) => {
    const orgType = val as 'waste_generator' | 'buyer' | 'recycler';
    let assignedRole: UserRole = 'waste_supplier';
    if (orgType === 'buyer') assignedRole = 'buyer';
    if (orgType === 'recycler') assignedRole = 'recycler';

    setFormData((prev) => ({
      ...prev,
      organization_type: orgType,
      role: assignedRole,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organization_name || !formData.facility_name) {
      setError('Please complete company and facility information.');
      return;
    }

    setError('');
    const res = await register(formData);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900">WasteMatch</span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
          Register Organization & Facility
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Join the Pune & Pimpri-Chinchwad circular industrial exchange network
        </p>

        {/* Step Indicator */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold">
          <div
            className={`flex items-center gap-1.5 pb-1 border-b-2 ${
              step === 1 ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-400'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>1. Officer Account</span>
          </div>
          <span className="text-slate-300">→</span>
          <div
            className={`flex items-center gap-1.5 pb-1 border-b-2 ${
              step === 2 ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-400'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>2. Industrial Facility</span>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <Input
                label="Full Name of Authorized Representative"
                placeholder="e.g. Anand Kulkarni"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
              />

              <Input
                label="Official Corporate Email"
                type="email"
                placeholder="anand.k@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                helperText="Must match your corporate or enterprise domain."
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Work Contact Number"
                  placeholder="+91 98220 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Designation / Role"
                  placeholder="Plant Manager / EHS Lead"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>

              <Input
                label="Account Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                helperText="Minimum 8 characters with numbers or symbols."
                required
              />

              <Button type="submit" variant="primary" className="w-full mt-4">
                <span>Continue to Facility Details</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Legal Entity Name"
                placeholder="e.g. Mahindra Precision Foundry Pvt Ltd"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                required
              />

              <Select
                label="Primary Business Activity (Role)"
                value={formData.organization_type}
                onChange={(e) => handleOrgTypeChange(e.target.value)}
                options={[
                  { value: 'waste_generator', label: 'Waste Generator / Producer (Lists byproducts)' },
                  { value: 'buyer', label: 'Industrial Buyer (Consumes secondary feedstock)' },
                  { value: 'recycler', label: 'Waste Recycler / Preprocessor (Recovery & Refinement)' },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Industrial Cluster Zone"
                  value={formData.industrial_zone}
                  onChange={(e) => setFormData({ ...formData, industrial_zone: e.target.value })}
                  options={[
                    { value: 'Bhosari MIDC', label: 'Bhosari MIDC (PCMC)' },
                    { value: 'Chakan MIDC Phase 1-4', label: 'Chakan MIDC Phase 1-4' },
                    { value: 'Talegaon MIDC', label: 'Talegaon Industrial Area' },
                    { value: 'Hinjawadi Phase 2-3', label: 'Hinjawadi Tech & Bio Zone' },
                    { value: 'Hadapsar / Mundhwa', label: 'Mundhwa / Hadapsar Estate' },
                  ]}
                />

                <Input
                  label="City / Jurisdiction"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  readOnly
                />
              </div>

              <Input
                label="Primary Facility / Plant Name"
                placeholder="e.g. Plant 01 - Casting & Machining Works"
                value={formData.facility_name}
                onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                helperText="Name of the physical site holding MPCB Consent to Operate."
                required
              />

              <div className="rounded-lg bg-emerald-50 p-3 text-[11px] text-emerald-800 border border-emerald-200">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Pilot Fast-Track Verification</span>
                </div>
                Your facility will be provisioned in the PCMC pilot registry. Full production consent validation occurs via our regulatory module.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/3"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Back</span>
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-2/3"
                  isLoading={isLoading}
                >
                  <span>Complete Registration</span>
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
