import React from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Factory,
  ChevronRight,
} from 'lucide-react';

export default function Home() {
  const supportedMaterials = [
    { title: 'Foundry Waste Silica Sand', origin: 'Ferrous / Non-ferrous casting', code: 'Schedule-IV' },
    { title: 'Post-Industrial Polymers', origin: 'Molding scrap & regrind (PP/PE)', code: 'Plastic Waste Rules' },
    { title: 'Neutralized Dewatered Sludge', origin: 'Automotive & Electroplating ETP', code: 'Hazardous Cat. 35.3' },
    { title: 'Spent Pickling Acid', origin: 'Steel cold rolling & galvanizing', code: 'CPCB Reuse Authorized' },
    { title: 'Blast Furnace & GGBS Slag', origin: 'Primary metallurgy & smelting', code: 'Fly Ash / Slag Circular' },
    { title: 'Aluminum Dross & Ash', origin: 'Secondary metal remelters', code: 'Recovery Mandate' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-slate-900">WasteMatch</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              PCMC / Pune Corridor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-6">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Pilot Framework • MPCB & Industrial Symbiosis Aligned</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Verified Industrial Waste-to-Resource <br />
            <span className="text-emerald-700">Exchange for Pune Manufacturers</span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            WasteMatch connects industrial waste generators with compliant buyers and recyclers in Bhosari, Chakan, and Talegaon. Featuring explainable technical matching, batch-level lab verification, and regulatory pre-clearance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
            >
              <span>Explore Interactive Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Factory className="h-4 w-4 text-slate-500" />
              <span>Register Industrial Plant</span>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>NABL Lab Test Verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Multi-Axis Hard Constraint Matching</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Zero Unverified Transfers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Workflow Steps */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">How It Works</h2>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Three Steps from Byproduct to Secondary Raw Material
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Characterize & List</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Producers register waste lots with physical/chemical specifications, MPCB categorization, and certified NABL lab test reports.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Explainable Matching</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                The engine evaluates hard acceptance constraints, preferred operating ranges, legal eligibility, and logistics radius.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Sample & Contract</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Buyers request material samples, execute lab qualification, and finalize bilateral transport under valid regulatory manifests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Materials in PCMC Corridor */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Material Directory</h2>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Priority Industrial Feedstocks
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>Explore live exchange</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedMaterials.map((mat, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{mat.title}</h4>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {mat.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{mat.origin}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-100/60 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">WasteMatch Platform</span>
            <span>•</span>
            <span>Pune / Pimpri-Chinchwad (PCMC) Municipal Region</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-800">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-slate-800">
              Register
            </Link>
            <Link href="/dashboard" className="hover:text-slate-800 font-semibold text-emerald-700">
              Live Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
